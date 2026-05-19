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

# --- 1. AI CONFIGURATION & SYNONYM DICTIONARY (MEDICAL SYNONYMS) ---
# Gemini AI configuration for RAG architecture
genai.configure(api_key="AIzaSyBHQ29R4RIMA4RMsQ6-_s6fHi3Z9rFGVkU")
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
    data = request.json
    results = recommender.get_recommendations(data.get('query', ''), user_profile=data.get('profile'))
    return jsonify(results)

@app.route('/api/products/personalized', methods=['POST'])
def get_personalized():
    profile = request.json.get('profile', {})
    # Recommendations based on health goals in the profile
    goal = profile.get('health_goal', 'general')
    results = recommender.get_recommendations(goal, user_profile=profile)
    return jsonify(results)

@app.route('/api/products/landing', methods=['GET'])
def get_landing():
    return jsonify(recommender.df.sample(min(8, len(recommender.df))).to_dict(orient='records'))

@app.route('/api/products/<int:pid>', methods=['GET'])
def get_detail(pid):
    product = recommender.df[recommender.df['id'] == pid]
    return jsonify(product.iloc[0].to_dict()) if not product.empty else (jsonify({"error": "Not found"}), 404)

@app.route('/api/products/similar/<int:pid>', methods=['GET'])
def get_similar_products(pid):
    product = recommender.df[recommender.df['id'] == pid]
    if product.empty:
        return jsonify([])
    category = product.iloc[0]['category']
    similar = recommender.df[(recommender.df['category'] == category) & (recommender.df['id'] != pid)]
    if similar.empty:
        similar = recommender.df[recommender.df['id'] != pid]
    return jsonify(similar.sample(min(4, len(similar))).to_dict(orient='records'))

# C. AUTH & PROFILE API GROUP (For identity management)
@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email', '')
    name = data.get('name', 'User')
    return jsonify({"status": "success", "message": "Registration successful", "user": {"id": 1, "email": email, "name": name, "profile": None}})

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '')
    return jsonify({"status": "success", "user": {"id": 1, "email": email, "name": "User", "profile": None}})

@app.route('/user/profile', methods=['POST'])
def update_profile():
    data = request.json
    return jsonify({
        "status": "success", 
        "message": "Personal profile updated",
        "profile": {
            "age": data.get("age"),
            "weight": data.get("weight"),
            "health_concerns": data.get("health_concerns"),
            "diseases": data.get("diseases", data.get("health_concerns"))
        }
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