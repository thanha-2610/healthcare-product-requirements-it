import pandas as pd
import json
import os
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

# Dictionary to bridge the semantic gap
synonyms_dict = {
    "headache": ["head pain", "top of head pain", "migraine", "heavy head", "sluggish head"],
    "stomach": ["belly", "epigastric", "heartburn", "upper abdominal pain", "stomach ulcer"],
    "eyes": ["eye pain", "eye strain", "dry eyes", "dizziness", "blurred vision"],
    "digestion": ["bloating", "indigestion", "constipation", "dysbiosis"]
}

# --- 2. ADVANCED RECOMMENDATION SYSTEM CLASS ---
class ProductRecommender:
    def __init__(self, data_path):
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"File not found: {data_path}")
        self.df = pd.read_csv(data_path)
        self.df.fillna('', inplace=True)
        
        # Create 'features' column by concatenating text columns
        self.df['features'] = self.df['name'].astype(str) + " " + self.df['category'].astype(str) + " " + self.df['description'].astype(str) + " " + self.df['health_goal'].astype(str)

        # Preprocessing: Enrich data with synonyms to increase matching (Semantic Enrichment)
        self.df['features'] = self.df['features'].apply(self.enrich_text)
        
        # Initialize TF-IDF matrix
        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['features'])

    def enrich_text(self, text):
        text = str(text).lower()
        for standard, synonyms in synonyms_dict.items():
            for syn in synonyms:
                if syn in text:
                    text += f" {standard}" # Add standard word to increase TF-IDF weight
        return text

    def get_recommendations(self, query, user_profile=None, top_n=5):
        # Convert user query to Vector
        query_vec = self.vectorizer.transform([query.lower()])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        related_indices = similarities.argsort()[::-1]
        
        results = []
        # Retrieve personalized information (Personalization)
        user_age = int(user_profile.get('age', 20)) if user_profile else 20
        user_allergies = user_profile.get('allergies', []) if user_profile else []

        for i in related_indices:
            if len(results) >= top_n: break
            product = self.df.iloc[i]
            score = similarities[i]

            # --- HARD FILTERS ---
            
            # A. Filter by age
            age_range = str(product.get('age_range', ''))
            if age_range and '-' in age_range:
                try:
                    min_age, max_age = map(int, age_range.split('-'))
                    if user_age < min_age or user_age > max_age:
                        continue
                except:
                    pass

            if score > 0.05: # Minimum threshold to ensure relevance
                results.append({
                    "id": int(product['id']),
                    "name": product['name'],
                    "category": product['category'],
                    "description": product['description'],
                    "health_goal": product.get('health_goal', ''),
                    "age_range": product.get('age_range', ''),
                    "weight_range": product.get('weight_range', ''),
                    "target_gender": product.get('target_gender', ''),
                    "similarity_score": round(float(score), 2)
                })
        return results

# Initialize Recommender
recommender = ProductRecommender('healthcare_data_en.csv')

# --- 3. API ENDPOINTS ---

# A. AI CHATBOT API (RAG - Retrieval Augmented Generation)
@app.route('/api/chatbot', methods=['POST'])
def chatbot_consult():
    data = request.json
    user_query = data.get('query', '')
    user_profile = data.get('profile', {"name": "Guest", "age": 22, "allergies": [], "history": "Normal"})
    
    # 1. Retrieval: Get suitable actual products
    products = recommender.get_recommendations(user_query, user_profile=user_profile, top_n=3)
    
    # 2. Build Context strictly following real data to avoid hallucination
    context = "\n".join([f"- {p['name']}: {p['description']}. Goal: {p.get('health_goal', '')}" for p in products])
    
    # 3. Prompt Engineering for LLM
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
    """
    
    try:
        response = llm_model.generate_content(prompt)
        return jsonify({"answer": response.text, "recommended_products": products})
    except Exception as e:
        return jsonify({"answer": "The chatbot is currently busy, please view the product list below.", "recommended_products": products})

# B. PRODUCTS & PERSONALIZATION API GROUP (For UI Discovery)
@app.route('/api/products/search', methods=['POST'])
def search_products():
    data = request.json or {}
    user_profile = data.get('profile')
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
    
    # Try to load user profile from users database if email is provided
    profile = {}
    users = load_users()
    if email in users and users[email].get('profile'):
        profile = users[email]['profile']
    
    goal = profile.get('health_goal', 'general')
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
    # Build dynamic category list with featured products
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
        
    popular_products = recommender.df.sample(min(8, len(recommender.df))).to_dict(orient='records')
    general_recommendations = recommender.df.sample(min(8, len(recommender.df))).to_dict(orient='records')
    
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
        
    similar_list = similar.sample(min(4, len(similar))).to_dict(orient='records')
    return jsonify({
        "status": "success",
        "similar_products": similar_list,
        "count": len(similar_list)
    })

@app.route('/api/products/categories', methods=['GET'])
def get_categories():
    categories = sorted(list(recommender.df['category'].unique()))
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
    products = recommender.df.sample(min(4, len(recommender.df))).to_dict(orient='records')
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
        # If user already exists, update username and password
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
        # For mock compatibility, dynamically auto-create a user if login with new email
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
    
    profile_data = {
        "age": data.get("age"),
        "weight": data.get("weight"),
        "health_concerns": data.get("health_concerns"),
        "diseases": data.get("diseases", data.get("health_concerns"))
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


# D. UTILITIES & DEBUG
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