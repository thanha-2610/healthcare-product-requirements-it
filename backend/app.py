import pandas as pd
import json
import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()

# --- 1. AI CONFIGURATION & SYNONYM DICTIONARY (MEDICAL SYNONYMS) ---
# Gemini AI configuration for RAG architecture 
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
llm_model = genai.GenerativeModel('gemini-1.5-flash')

# Dictionary to bridge the semantic gap [cite: 660, 935]
synonyms_dict = {
    "headache": ["head pain", "top of head pain", "migraine", "heavy head", "sluggish head"],
    "stomach": ["belly", "epigastric", "heartburn", "upper abdominal pain", "stomach ulcer"],
    "eyes": ["eye pain", "eye strain", "dry eyes", "dizziness", "blurred vision"],
    "digestion": ["bloating", "indigestion", "constipation", "dysbiosis"]
}

# Dictionary mapping Vietnamese health symptoms/goals to English search keywords
vi_en_dictionary = {
    "đau đầu": "headache migraine head pain",
    "nhức đầu": "headache migraine head pain",
    "đau nửa đầu": "migraine headache",
    "mất ngủ": "insomnia sleep difficulty falling asleep sleep disorder",
    "khó ngủ": "insomnia sleep difficulty falling asleep",
    "mệt mỏi": "fatigue tiredness weakness chronic fatigue burnout energy",
    "uể oải": "fatigue sluggish tiredness",
    "suy nhược": "weakness fatigue neurasthenia",
    "mắc ói": "nausea vomiting upset stomach",
    "buồn nôn": "nausea vomiting upset stomach",
    "nôn": "vomiting nausea",
    "đau bụng": "stomach ache belly abdominal pain indigestion heartburn",
    "đau dạ dày": "stomach pain ulcer heartburn stomach acid reflux gastrointestinal",
    "trào ngược": "acid reflux heartburn stomach",
    "ợ chua": "heartburn acid reflux indigestion",
    "ợ nóng": "heartburn acid reflux",
    "đầy hơi": "bloating gas indigestion flatulence stomach",
    "khó tiêu": "indigestion bloating gas",
    "táo bón": "constipation digestion bowel movement",
    "tiêu chảy": "diarrhea digestion loose stool",
    "đau khớp": "joint pain arthritis osteoarthritis knee pain stiffness",
    "nhức khớp": "joint pain arthritis osteoarthritis stiffness",
    "thoái hóa": "degeneration osteoarthritis joint",
    "đau lưng": "back pain spinal bone pain",
    "loãng xương": "osteoporosis weak bones calcium deficiency",
    "chuột rút": "cramps muscle spasm magnesium",
    "đau cơ": "muscle pain soreness aches workout recovery",
    "căng cơ": "muscle tension cramps stress",
    "rụng tóc": "hair loss hair shedding hair thinning biotin",
    "hói": "baldness hair loss",
    "da khô": "dry skin skin dehydration",
    "nhăn da": "wrinkles skin aging skin glow hyaluronic collagen",
    "lão hóa": "aging anti-aging skin wrinkles",
    "mụn": "acne skin pimples hormonal",
    "lo âu": "anxiety stress nervous tension",
    "căng thẳng": "stress anxiety burnout mental fatigue work stress",
    "stress": "stress anxiety burnout tension",
    "hồi hộp": "palpitations heartbeat anxiety nervous",
    "tim đập nhanh": "fast heartbeat palpitations",
    "chóng mặt": "dizziness vertigo lightheaded",
    "hoa mắt": "dizziness blurred vision eye strain",
    "ù tai": "tinnitus ringing in ears",
    "trí nhớ": "memory brain focus cognitive dementia forgetfulness",
    "hay quên": "forgetfulness memory brain cognitive",
    "tập trung": "focus concentration brain study",
    "mắt mờ": "blurred vision eye strain dry eyes",
    "khô mắt": "dry eyes eye strain screen",
    "mỏi mắt": "eye strain tired eyes screens",
    "đề kháng": "immune system immunity resistance frequent flu cold",
    "miễn dịch": "immune system immunity resistance",
    "cảm cúm": "flu cold cough congestion sinus",
    "ho": "cough phlegm respiratory throat sore",
    "đờm": "phlegm cough mucus respiratory",
    "phổi": "lung respiratory breathing cough smoke",
    "huyết áp": "blood pressure hypertension cardiovascular",
    "tim mạch": "heart cardiovascular circulation cholesterol",
    "gan": "liver fatty liver hepatitis detox drinking alcohol men gan",
    "men gan": "liver enzymes liver detox",
    "tiểu đêm": "nocturia urination prostate frequent urination",
    "tiểu nhiều": "frequent urination prostate bladder",
    "sinh lý": "libido erectile dysfunction testosterone male health",
    "yếu sinh lý": "low libido testosterone sexual energy",
    "giảm ham muốn": "low libido testosterone sex drive",
    "dị ứng": "allergy rhinitis sneezing histamine skin redness",
    "ngứa": "itchy skin allergy eczema",
    "mùi cơ thể": "body odor bad breath smell",
    "hôi miệng": "bad breath body odor mouth",
    "thanh lọc": "detox cleanse colon fiber",
    "thải độc": "detox liver cleanse",
    "bổ máu": "anemia iron blood circulation pale skin",
    "thiếu máu": "anemia iron blood circulation",
}

def translate_query_to_english(query):
    query_lower = str(query).lower()
    translated_terms = []
    
    # Check exact matching of Vietnamese phrases in the query
    for vi_term, en_term in vi_en_dictionary.items():
        if vi_term in query_lower:
            translated_terms.append(en_term)
            
    # If we found matches, append them to the query to enrich it
    if translated_terms:
        enriched_query = query_lower + " " + " ".join(translated_terms)
        return enriched_query
    return query_lower


# --- 2. ADVANCED RECOMMENDATION SYSTEM CLASS ---
class ProductRecommender:
    def __init__(self, db_path='healthcare.db', csv_path='healthcare_data_en.csv'):
        self.db_path = db_path
        self.vectorizer = TfidfVectorizer()
        
        # Khởi tạo cấu trúc cơ sở dữ liệu SQLite [cite: 723]
        self.init_database(csv_path)
        # Nạp dữ liệu và huấn luyện ma trận TF-IDF ban đầu
        self.load_knowledge_base()

    def init_database(self, csv_path):
        """Khởi tạo bảng products trong SQLite theo đúng Schema cấu trúc đồ án [cite: 731, 741]"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Kiểm tra xem cấu trúc bảng cũ có thiếu cột không (để tự động nâng cấp nếu đã chạy trước đó)
        try:
            cursor.execute("PRAGMA table_info(products)")
            columns = [info[1] for info in cursor.fetchall()]
            if columns and 'health_goal' not in columns:
                cursor.execute("DROP TABLE products")
                conn.commit()
        except Exception as e:
            print(f"Lỗi kiểm tra/nâng cấp bảng: {e}")

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT,
                description TEXT,
                target_gender TEXT,
                health_goal TEXT,
                age_range TEXT,
                weight_range TEXT,
                contraindication TEXT
            )
        ''')
        conn.commit()
        
        # Nếu database SQLite mới tạo và chưa có dữ liệu, tự động đổ dữ liệu (bootstrap) từ file CSV vào 
        cursor.execute("SELECT COUNT(*) FROM products")
        if cursor.fetchone()[0] == 0 and os.path.exists(csv_path):
            try:
                df_csv = pd.read_csv(csv_path)
                for _, row in df_csv.iterrows():
                    cursor.execute('''
                        INSERT INTO products (id, name, category, description, target_gender, health_goal, age_range, weight_range, contraindication)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        int(row['id']) if 'id' in row and not pd.isna(row['id']) else None,
                        row.get('name', ''),
                        row.get('category', ''),
                        row.get('description', ''),
                        row.get('target_gender', 'All'),
                        row.get('health_goal', ''),
                        row.get('age_range', ''),
                        row.get('weight_range', ''),
                        row.get('contraindication', '')
                    ))
                conn.commit()
            except Exception as e:
                print(f"Lỗi khi đổ dữ liệu từ CSV vào SQLite: {e}")
        conn.close()

    def load_knowledge_base(self):
        """Đọc tri thức sản phẩm từ SQLite và tiến hành vector hóa TF-IDF [cite: 744, 747]"""
        conn = sqlite3.connect(self.db_path)
        self.df = pd.read_sql_query("SELECT * FROM products", conn)
        conn.close()
        
        self.df.fillna('', inplace=True)
        
        # Tổng hợp đặc trưng từ các trường dữ liệu có trong bảng SQLite [cite: 655, 740]
        self.df['features'] = (
            self.df['name'].astype(str) + " " + 
            self.df['category'].astype(str) + " " + 
            self.df['description'].astype(str) + " " + 
            self.df['health_goal'].astype(str)
        )

        # Tiền xử lý và làm giàu dữ liệu bằng từ điển đồng nghĩa y khoa [cite: 656]
        self.df['features'] = self.df['features'].apply(self.enrich_text)
        
        # Khớp ma trận vector TF-IDF
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['features'])

    def update_knowledge_base(self, updated_df):
        """Cập nhật tri thức thời gian thực (On-the-fly Retraining) khi Admin thêm sản phẩm """
        self.df = updated_df
        self.df.fillna('', inplace=True)
        self.df['features'] = (
            self.df['name'].astype(str) + " " + 
            self.df['category'].astype(str) + " " + 
            self.df['description'].astype(str) + " " + 
            self.df['health_goal'].astype(str)
        )
        self.df['features'] = self.df['features'].apply(self.enrich_text)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['features'])

    def enrich_text(self, text):
        text = str(text).lower()
        for standard, synonyms in synonyms_dict.items():
            for syn in synonyms:
                if syn in text:
                    text += f" {standard}" # Thêm từ khóa chuẩn hóa để tăng trọng số TF-IDF [cite: 661]
        return text

    def get_recommendations(self, query, user_profile=None, top_n=5):
        if self.df.empty:
            return []
            
        # Dịch và làm giàu truy vấn tiếng Việt sang tiếng Anh
        enriched_query = translate_query_to_english(query)
            
        # Chuyển đổi truy vấn người dùng thành Vector [cite: 674]
        query_vec = self.vectorizer.transform([enriched_query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        related_indices = similarities.argsort()[::-1]
        
        results = []
        user_age = 20
        if user_profile and user_profile.get('age'):
            try:
                user_age = int(user_profile.get('age'))
            except (ValueError, TypeError):
                user_age = 20
                
        # Lấy danh sách dị ứng từ hồ sơ sinh trắc học [cite: 406, 677]
        user_allergies = user_profile.get('allergies', []) if user_profile else []
        if isinstance(user_allergies, str):
            user_allergies = [a.strip().lower() for a in user_allergies.split(',') if a.strip()]

        for i in related_indices:
            if len(results) >= top_n: break
            product = self.df.iloc[i]
            score = similarities[i]

            # --- HARD FILTERS (BỘ LỌC CỨNG AN TOÀN Y KHOA) ---
            
            # A. Bộ lọc theo độ tuổi chỉ định [cite: 678, 683]
            age_range = str(product.get('age_range', '')).strip().lower()
            if age_range:
                min_age, max_age = 0, 150
                if '-' in age_range:
                    try:
                        parts = age_range.split('-')
                        min_age = int(parts[0])
                        max_age = int(parts[1])
                    except:
                        pass
                elif age_range == 'adult':
                    min_age, max_age = 18, 150
                elif age_range == 'all':
                    min_age, max_age = 0, 150
                
                if user_age < min_age or user_age > max_age:
                    continue # Bỏ qua sản phẩm nếu vi phạm ràng buộc tuổi [cite: 684]

            # B. Bộ lọc theo tiền sử dị ứng thành phần (Bổ sung hoàn chỉnh theo mô tả đồ án) [cite: 407, 824]
            contraindication_text = str(product.get('contraindication', '')).lower()
            is_allergic = False
            for allergy in user_allergies:
                if allergy and allergy in contraindication_text:
                    is_allergic = True
                    break
            if is_allergic:
                continue # Bỏ qua nếu chứa thành phần chống chỉ định trùng với tiền sử dị ứng [cite: 407]

            if score > 0.05: # Ngưỡng liên quan tối thiểu [cite: 680]
                results.append({
                    "id": int(product['id']),
                    "name": product['name'],
                    "category": product['category'],
                    "description": product['description'],
                    "target_gender": product.get('target_gender', 'All'),
                    "health_goal": product.get('health_goal', ''),
                    "age_range": product.get('age_range', ''),
                    "weight_range": product.get('weight_range', ''),
                    "contraindication": product.get('contraindication', ''),
                    "similarity_score": round(float(score), 2)
                })
        return results

# Định nghĩa đường dẫn tuyệt đối cho SQLite và CSV
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'healthcare.db')
CSV_PATH = os.path.join(BASE_DIR, 'healthcare_data_en.csv')

# Khởi tạo bộ máy Recommender liên kết với SQLite [cite: 726]
recommender = ProductRecommender(db_path=DB_PATH, csv_path=CSV_PATH)

# --- 3. API ENDPOINTS ---

# ROUTE QUẢN TRỊ VIÊN: Thêm mới sản phẩm & Cập nhật tri thức thời gian thực [cite: 743, 749]
@app.route('/api/admin/products', methods=['POST'])
def admin_add_product():
    data = request.json
    try:
        conn = sqlite3.connect(recommender.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO products (name, category, description, target_gender, health_goal, age_range, weight_range, contraindication)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['name'],   
            data['category'],            
            data['description'],            
            data.get('target_gender', 'All'),            
            data.get('health_goal', ''),            
            data.get('age_range', ''),            
            data.get('weight_range', ''),            
            data.get('contraindication', '')        
        ))
        conn.commit()
        new_id = cursor.lastrowid
        
        # Đọc lại tập dữ liệu mới từ SQLite 
        updated_df = pd.read_sql_query("SELECT * FROM products", conn)
        conn.close()       
        
        # Tiến hành làm tươi ma trận đặc trưng TF-IDF ngay lập tức (On-the-fly Retraining) [cite: 496, 751]
        recommender.update_knowledge_base(updated_df)
        
        return jsonify({
            "status": "success",
            "message": "Sản phẩm đã được lưu và cập nhật hệ thống tư vấn AI thành công!",
            "id": new_id
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# A. AI CHATBOT API (RAG - Retrieval Augmented Generation) [cite: 686]
@app.route('/api/chatbot', methods=['POST'])
def chatbot_consult():
    data = request.json
    user_query = data.get('query', '')
    user_profile = data.get('profile', {"name": "Guest", "age": 22, "allergies": [], "history": "Normal"})
    
    # 1. Retrieval: Lấy danh sách sản phẩm thật từ CSDL [cite: 688]
    products = recommender.get_recommendations(user_query, user_profile=user_profile, top_n=3)
    
    # 2. Xây dựng chuỗi văn bản ngữ cảnh bám sát dữ liệu thật [cite: 689]
    context = "\n".join([f"- {p['name']}: {p['description']}. Chống chỉ định: {p.get('contraindication', '')}" for p in products])
    
    # 3. Prompt Engineering ràng buộc chặt chẽ [cite: 690, 698]
    prompt = f"""
    You are a health consultant for the Healthcare Recommendation project.
    Based on the following list of REAL medical products:
    {context}
    
    User information: {user_profile['name']}, {user_profile['age']} years old, medical history: {user_profile.get('history')}.
    User asks: "{user_query}"
    
    REQUIREMENTS:
    1. Only advise based on the above product list. Do not arbitrarily invent other medications.
    2. Explain why the product is suitable for the user's symptoms.
    3. Emphasize safety precautions and advise seeing a doctor if necessary.
    4. Respond in Vietnamese in a helpful, friendly, and professional tone.
    """
    
    try:
        response = llm_model.generate_content(prompt)
        return jsonify({"answer": response.text, "recommended_products": products})
    except Exception as e:
        # Cơ chế dự phòng Fallback khi lỗi dịch vụ AI ngoài [cite: 703, 713]
        # Tạo phản hồi tiếng Việt thân thiện liệt kê chi tiết các sản phẩm tìm được
        import random
        greetings = [
            "Chào bạn! Rất tiếc là kết nối AI của tôi đang gián đoạn, nhưng tôi đã tìm thấy các sản phẩm phù hợp nhất với các triệu chứng của bạn bên dưới:",
            "Xin chào! Hệ thống tư vấn AI hiện đang bận một chút, tuy nhiên dựa trên thông tin bạn chia sẻ, đây là những sản phẩm khuyên dùng dành cho bạn:",
            "Chào bạn, tôi đang gặp lỗi kết nối với máy chủ AI. Dưới đây là các sản phẩm chăm sóc sức khỏe phù hợp nhất với triệu chứng của bạn:"
        ]
        
        answer = random.choice(greetings) + "\n\n"
        if products:
            for idx, p in enumerate(products, 1):
                answer += f"**{idx}. {p['name']}** ({p['category']})\n"
                answer += f"- Công dụng: {p['description']}\n"
                if p.get('contraindication'):
                    answer += f"- Chống chỉ định: {p['contraindication']}\n"
                answer += "\n"
            answer += "Lưu ý: Bạn nên đọc kỹ hướng dẫn sử dụng hoặc tham khảo ý kiến bác sĩ/dược sĩ trước khi dùng để đảm bảo an toàn."
        else:
            answer = "Chào bạn! Hiện tại tôi chưa tìm thấy sản phẩm nào khớp chính xác với mô tả triệu chứng của bạn. Bạn vui lòng mô tả chi tiết hơn hoặc liên hệ bác sĩ để được tư vấn chính xác nhé."
            
        return jsonify({
            "answer": answer, 
            "recommended_products": products
        })

# B. PRODUCTS & PERSONALIZATION API GROUP
@app.route('/api/products/search', methods=['POST'])
def search_products():
    data = request.json or {}
    user_profile = data.get('profile') or {}
    results = recommender.get_recommendations(data.get('query', ''), user_profile=user_profile)
    return jsonify({
        "status": "success",
        "products": results,
        "query": data.get('query', ''),
        "count": len(results)
    })

@app.route('/api/products/personalized', methods=['POST'])
def get_personalized():
    data = request.json or {}
    email = data.get('email', '')
    
    profile = {}
    users = load_users()
    if email in users and users[email].get('profile'):
        profile = users[email]['profile']
    
    # Lấy trường dữ liệu lo ngại sức khỏe làm query đề xuất cá nhân hóa [cite: 718]
    goal = profile.get('health_concerns', 'general')
    results = recommender.get_recommendations(goal, user_profile=profile)
    
    return jsonify({
        "status": "success",
        "recommendations": results,
        "count": len(results),
        "based_on": {
            "has_profile": bool(profile),
            "view_history_count": 0,
            "search_history_count": 0
        }
    })

@app.route('/api/products/landing', methods=['GET'])
def get_landing():
    if recommender.df.empty:
        return jsonify({
            "status": "success", "categories": [], "popular_products": [], 
            "general_recommendations": [], "total_products": 0
        })
        
    categories_list = []
    try:
        grouped = recommender.df.groupby('category')
        for cat_name, group in grouped:
            featured = group.sample(1).iloc[0].to_dict() if not group.empty else {}
            categories_list.append({
                "category": cat_name,
                "count": len(group),
                "featured_product": featured
            })
    except Exception as e:
        print(f"Error grouping categories: {e}")
        
    sample_size = min(8, len(recommender.df))
    popular_products = recommender.df.sample(sample_size).to_dict(orient='records')
    general_recommendations = recommender.df.sample(sample_size).to_dict(orient='records')
    
    return jsonify({
        "status": "success",
        "categories": categories_list,
        "popular_products": popular_products,
        "general_recommendations": general_recommendations,
        "total_products": len(recommender.df)
    })

@app.route('/api/products/<int:pid>', methods=['GET'])
def get_detail(pid):
    product = recommender.df[recommender.df['id'] == pid]
    if product.empty:
        return jsonify({"status": "error", "message": "Product not found"}), 404
        
    return jsonify({
        "status": "success",
        "product": product.iloc[0].to_dict()
    })

@app.route('/api/products/similar/<int:pid>', methods=['GET'])
def get_similar_products(pid):
    product = recommender.df[recommender.df['id'] == pid]
    if product.empty:
        return jsonify({"status": "success", "similar_products": [], "count": 0})
        
    category = product.iloc[0]['category']
    similar = recommender.df[(recommender.df['category'] == category) & (recommender.df['id'] != pid)]
    if similar.empty:
        similar = recommender.df[recommender.df['id'] != pid]
        
    sample_size = min(4, len(similar))
    similar_list = similar.sample(sample_size).to_dict(orient='records') if sample_size > 0 else []
    return jsonify({
        "status": "success",
        "similar_products": similar_list,
        "count": len(similar_list)
    })

@app.route('/api/products/categories', methods=['GET'])
def get_categories():
    categories = sorted(list(recommender.df['category'].unique())) if not recommender.df.empty else []
    return jsonify({
        "status": "success",
        "categories": categories,
        "count": len(categories)
    })

@app.route('/api/products/view', methods=['POST'])
def track_view():
    return jsonify({"status": "success"})

@app.route('/api/products/view-history', methods=['POST'])
def view_history():
    sample_size = min(4, len(recommender.df))
    products = recommender.df.sample(sample_size).to_dict(orient='records') if sample_size > 0 else []
    return jsonify({
        "status": "success",
        "products": products,
        "count": len(products)
    })

# C. AUTH & PROFILE API GROUP (For identity management)
USERS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'users.json')

def load_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading users: {e}")
    return {}

def save_users(users):
    try:
        os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving users: {e}")

@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    username = data.get('username', 'User').strip()
    password = data.get('password', '')

    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    users = load_users()
    if email in users:
        users[email]['name'] = username
        users[email]['username'] = username
        if password:
            users[email]['password'] = password
    else:
        users[email] = {
            "email": email,
            "name": username,
            "username": username,
            "password": password,
            "profile": None
        }
    
    save_users(users)
    
    user_info = {
        "id": 1,
        "email": email,
        "name": username,
        "username": username,
        "profile": users[email].get("profile")
    }
    return jsonify({"status": "success", "message": "Registration successful", "user": user_info})

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    users = load_users()
    if email not in users:
        users[email] = {
            "email": email,
            "name": "User",
            "username": "User",
            "password": password,
            "profile": None
        }
        save_users(users)

    user_data = users[email]
    
    user_info = {
        "id": 1,
        "email": email,
        "name": user_data.get("username", user_data.get("name", "User")),
        "username": user_data.get("username", user_data.get("name", "User")),
        "profile": user_data.get("profile")
    }
    return jsonify({"status": "success", "user": user_info})

@app.route('/user/profile', methods=['POST'])
def update_profile():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    
    # Đồng bộ các trường khảo sát đầu vào đúng theo schema [cite: 718]
    profile_data = {
        "age": data.get("age"),
        "weight": data.get("weight"),
        "health_concerns": data.get("health_concerns"),
        "allergies": data.get("allergies", data.get("diseases", ""))
    }
    
    if email:
        users = load_users()
        if email in users:
            users[email]['profile'] = profile_data
        else:
            users[email] = {
                "email": email,
                "name": "User",
                "username": "User",
                "password": "",
                "profile": profile_data
            }
        save_users(users)
        
    return jsonify({
        "status": "success", 
        "message": "Personal profile updated",
        "profile": profile_data
    })

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
    print(" -> [POST] /api/admin/products (Admin Add Product)")
    print(" -> [POST] /user/profile (Personalization Data)")
    print("="*60 + "\n")
    app.run(debug=True, port=5000)