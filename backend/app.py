import pandas as pd
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# --- 1. CẤU HÌNH AI & TỪ ĐIỂN ĐỒNG NGHĨA (MEDICAL SYNONYMS) ---
# Cấu hình Gemini AI cho kiến trúc RAG [cite: 25, 32]
genai.configure(api_key="AIzaSyBHQ29R4RIMA4RMsQ6-_s6fHi3Z9rFGVkU")
llm_model = genai.GenerativeModel('gemini-1.5-flash')

# Bộ từ điển giúp thu hẹp khoảng cách ngữ nghĩa (Semantic Gap) [cite: 15, 20]
synonyms_dict = {
    "đau đầu": ["nhức đầu", "đau đỉnh đầu", "migraine", "nặng đầu", "uể oải đầu"],
    "dạ dày": ["bao tử", "thượng vị", "ợ chua", "đau bụng trên", "loét dạ dày"],
    "mắt": ["nhức mắt", "mỏi mắt", "khô mắt", "xoay xẩm mặt mày", "mờ mắt"],
    "tiêu hóa": ["đầy hơi", "khó tiêu", "táo bón", "loạn khuẩn"]
}

# --- 2. LỚP XỬ LÝ GỢI Ý CHUYÊN SÂU (RECOMMENDER SYSTEM) ---
class ProductRecommender:
    def __init__(self, data_path):
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Không tìm thấy file {data_path}")
        self.df = pd.read_csv(data_path)
        self.df.fillna('', inplace=True)
        
        # Tạo cột features bằng cách gộp các cột văn bản
        self.df['features'] = self.df['name'].astype(str) + " " + self.df['category'].astype(str) + " " + self.df['description'].astype(str) + " " + self.df['health_goal'].astype(str)

        # Tiền xử lý: Làm giàu dữ liệu bằng từ đồng nghĩa để tăng độ khớp (Semantic Enrichment)
        self.df['features'] = self.df['features'].apply(self.enrich_text)
        
        # Khởi tạo ma trận TF-IDF
        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['features'])

    def enrich_text(self, text):
        text = str(text).lower()
        for standard, synonyms in synonyms_dict.items():
            for syn in synonyms:
                if syn in text:
                    text += f" {standard}" # Thêm từ chuẩn vào để tăng trọng số TF-IDF
        return text

    def get_recommendations(self, query, user_profile=None, top_n=5):
        # Chuyển đổi truy vấn người dùng thành Vector [cite: 19, 63]
        query_vec = self.vectorizer.transform([query.lower()])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        related_indices = similarities.argsort()[::-1]
        
        results = []
        # Lấy thông tin cá nhân hóa (Personalization) [cite: 11, 73]
        user_age = int(user_profile.get('age', 20)) if user_profile else 20
        user_allergies = user_profile.get('allergies', []) if user_profile else []

        for i in related_indices:
            if len(results) >= top_n: break
            product = self.df.iloc[i]
            score = similarities[i]

            # --- BỘ LỌC CỨNG (HARD FILTERS) ---
            
            # A. Lọc theo độ tuổi
            age_range = str(product.get('age_range', ''))
            if age_range and '-' in age_range:
                try:
                    min_age, max_age = map(int, age_range.split('-'))
                    if user_age < min_age or user_age > max_age:
                        continue
                except:
                    pass

            if score > 0.05: # Ngưỡng tối thiểu để đảm bảo tính liên quan
                results.append({
                    "id": int(product['id']),
                    "name": product['name'],
                    "category": product['category'],
                    "description": product['description'],
                    "health_goal": product.get('health_goal', ''),
                    "similarity_score": round(float(score), 2)
                })
        return results

# Khởi tạo Recommender
recommender = ProductRecommender('healthcare_data.csv')

# --- 3. CÁC API ENDPOINTS ---

# A. API CHATBOT AI (RAG - Retrieval Augmented Generation) [cite: 25, 32, 67]
@app.route('/api/chatbot', methods=['POST'])
def chatbot_consult():
    data = request.json
    user_query = data.get('query', '')
    user_profile = data.get('profile', {"name": "Khách", "age": 22, "allergies": [], "history": "Bình thường"})
    
    # 1. Retrieval: Lấy sản phẩm thực tế phù hợp [cite: 68]
    products = recommender.get_recommendations(user_query, user_profile=user_profile, top_n=3)
    
    # 2. Xây dựng Ngữ cảnh (Context) bám sát dữ liệu thật để tránh ảo giác [cite: 31, 71]
    context = "\n".join([f"- {p['name']}: {p['description']}. Mục tiêu: {p.get('health_goal', '')}" for p in products])
    
    # 3. Prompt Engineering cho LLM [cite: 69, 70]
    prompt = f"""
    Bạn là chuyên gia tư vấn sức khỏe của dự án Healthcare Recommendation.
    Dựa trên danh sách sản phẩm y tế THẬT sau đây:
    {context}
    
    Thông tin người dùng: {user_profile['name']}, {user_profile['age']} tuổi, tiền sử: {user_profile.get('history')}.
    Người dùng hỏi: "{user_query}"
    
    YÊU CẦU:
    1. Chỉ tư vấn dựa trên danh sách sản phẩm trên. Không tự ý bịa thêm thuốc khác.
    2. Giải thích tại sao sản phẩm đó phù hợp với triệu chứng của người dùng.
    3. Nhấn mạnh các lưu ý an toàn và khuyên đi khám bác sĩ nếu cần.
    """
    
    try:
        response = llm_model.generate_content(prompt)
        return jsonify({"answer": response.text, "recommended_products": products})
    except Exception as e:
        return jsonify({"answer": "Chatbot đang bận, mời bạn xem danh sách sản phẩm bên dưới.", "recommended_products": products})

# B. NHÓM API SẢN PHẨM & CÁ NHÂN HÓA (Dành cho UI Discovery) [cite: 87, 141]
@app.route('/api/products/search', methods=['POST'])
def search_products():
    data = request.json
    results = recommender.get_recommendations(data.get('query', ''), user_profile=data.get('profile'))
    return jsonify(results)

@app.route('/api/products/personalized', methods=['POST'])
def get_personalized():
    profile = request.json.get('profile', {})
    # Gợi ý dựa trên mục tiêu sức khỏe trong hồ sơ
    goal = profile.get('health_goal', 'tổng quát')
    results = recommender.get_recommendations(goal, user_profile=profile)
    return jsonify(results)

@app.route('/api/products/landing', methods=['GET'])
def get_landing():
    return jsonify(recommender.df.sample(min(6, len(recommender.df))).to_dict(orient='records'))

@app.route('/api/products/<int:pid>', methods=['GET'])
def get_detail(pid):
    product = recommender.df[recommender.df['id'] == pid]
    return jsonify(product.iloc[0].to_dict()) if not product.empty else (jsonify({"error": "Not found"}), 404)

# C. NHÓM API AUTH & PROFILE (Dành cho quản lý định danh) [cite: 140, 145]
@app.route('/auth/signup', methods=['POST'])
def signup():
    return jsonify({"status": "success", "message": "Đăng ký thành công"})

@app.route('/auth/login', methods=['POST'])
def login():
    return jsonify({"status": "success", "user": {"id": 1, "username": "nha_it"}})

@app.route('/user/profile', methods=['POST'])
def update_profile():
    return jsonify({"status": "success", "message": "Đã cập nhật hồ sơ cá nhân"})

# D. TIỆN ÍCH & DEBUG [cite: 157]
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "data_loaded": len(recommender.df)})

if __name__ == '__main__':
    print("\n" + "="*60)
    print(" HEALTHCARE AI RECOMMENDATION SERVER RUNNING ")
    print(" URL: http://localhost:5000 ")
    print("="*60)
    print(" CORE APIs READY:")
    print(" -> [POST] /api/chatbot (RAG AI)")
    print(" -> [POST] /api/products/search (TF-IDF)")
    print(" -> [POST] /user/profile (Personalization Data)")
    print("="*60 + "\n")
    app.run(debug=True, port=5000)