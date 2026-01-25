from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Database giả lập (Trong thực tế Nhã sẽ dùng MongoDB/SQL)
USERS = {
    "nha@gmail.com": {"password": "123", "name": "Dương Thị Nhã", "profile": None}
}

def load_data():
    df = pd.read_csv('healthcare_data.csv').fillna('')
    df['combined_features'] = (df['category'] + " " + df['description'] + " " + df['goal']).astype(str)
    return df

# API Đăng ký
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    if email in USERS: return jsonify({"message": "Email đã tồn tại"}), 400
    USERS[email] = {"password": data.get('password'), "name": data.get('name'), "profile": None}
    return jsonify({"status": "success", "user": {"email": email, "name": data.get('name')}})

# API Đăng nhập
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = USERS.get(data.get('email'))
    if user and user['password'] == data.get('password'):
        return jsonify({"status": "success", "user": {"email": data.get('email'), "name": user['name'], "profile": user['profile']}})
    return jsonify({"message": "Sai tài khoản"}), 401

# API Machine Learning (Dùng chung cho cả Home và Cá nhân hóa)
@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    query = data.get('query', 'sức khỏe')
    
    # Nếu là query từ Survey, ta tính toán thêm logic BMI ở đây nếu cần
    # (Ví dụ: query = "Nam 25 tuổi béo phì dạ dày")
    
    df = load_data()
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['combined_features'])
    query_vec = tfidf.transform([query])
    cosine_sim = cosine_similarity(query_vec, tfidf_matrix)
    
    sim_scores = sorted(list(enumerate(cosine_sim[0])), key=lambda x: x[1], reverse=True)
    results = []
    for i in sim_scores[:8]:
        item = df.iloc[i[0]].to_dict()
        item['score'] = round(float(i[1]) * 100, 1)
        if item['score'] > 0: results.append(item)
    return jsonify(results)

if __name__ == '__main__':
    app.run(port=5000, debug=True)