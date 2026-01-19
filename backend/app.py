from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# --- PHẦN 1: CHUẨN BỊ DỮ LIỆU ---
def load_data():
    df = pd.read_csv('healthcare_data.csv').fillna('')
    # Kết hợp các cột thành 1 đoạn văn bản để máy học đặc trưng sản phẩm
    df['combined_features'] = df['category'] + " " + df['description'] + " " + df['health_goal'] + " " + df['target_gender']
    return df

# --- PHẦN 2: THUẬT TOÁN MACHINE LEARNING (TF-IDF & COSINE) ---
def get_recommendations(user_query, num_results=4):
    df = load_data()
    
    # Khởi tạo mô hình TF-IDF
    tfidf = TfidfVectorizer(stop_words='english')
    # Biến nội dung sản phẩm thành ma trận số (Vector hóa)
    tfidf_matrix = tfidf.fit_transform(df['combined_features'])
    
    # Biến câu hỏi của người dùng thành vector số tương ứng
    user_vec = tfidf.transform([user_query])
    
    # Tính toán độ tương đồng Cosine (Cosine Similarity)
    cosine_sim = cosine_similarity(user_vec, tfidf_matrix)
    
    # Sắp xếp và lấy các sản phẩm có điểm cao nhất
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    results = []
    for i in sim_scores[:num_results]:
        idx = i[0]
        score = i[1]
        if score > 0: # Chỉ lấy sản phẩm có liên quan
            item = df.iloc[idx].to_dict()
            item['score'] = round(float(score) * 100, 1)
            results.append(item)
    return results

# --- PHẦN 3: CÁC ENDPOINT API ---

# API Gợi ý (Dùng chung cho cả Khách và User)
@app.route('/api/recommend', methods=['POST'])
def recommend_api():
    data = request.json
    query = data.get('query', 'sức khỏe')
    results = get_recommendations(query)
    return jsonify(results)

# API Giả lập Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Giả lập: Cứ nhập đúng 'admin'/'123' là vào
    if username == 'nhaduong' and password == '123456':
        return jsonify({
            "status": "success",
            "user": {
                "id": 1,
                "name": "Dương Thị Nhã",
                "role": "user"
            }
        })
    return jsonify({"status": "error", "message": "Sai tài khoản"}), 401

# API Lấy danh mục chủ đề (Cho trang Home)
@app.route('/api/themes', methods=['GET'])
def get_themes():
    themes = ["Tăng cơ", "Giảm cân", "Tăng miễn dịch", "Giảm stress"]
    return jsonify(themes)

if __name__ == '__main__':
    print("AI Backend đang chạy tại http://127.0.0.1:5000")
    app.run(port=5000, debug=True)