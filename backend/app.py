from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime
import numpy as np
from collections import defaultdict

app = Flask(__name__)

# ==================== CORS CONFIG ====================
CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# ==================== DATABASE ====================
USERS = {}
USER_VIEW_HISTORY = defaultdict(list)
USER_SEARCH_HISTORY = defaultdict(list)

# ==================== LOAD DATA ====================
def load_healthcare_data():
    """Load và xử lý dữ liệu sản phẩm"""
    try:
        df = pd.read_csv('healthcare_data.csv')
        print(f"✅ Loaded {len(df)} products")
        
        # Chuẩn hóa dữ liệu
        df = df.fillna('')
        
        # Tạo features cho ML
        df['features'] = (
            df['name'].str.lower() + " " + 
            df['category'].str.lower() + " " + 
            df['description'].str.lower() + " " + 
            df['target_gender'].str.lower() + " " + 
            df['health_goal'].str.lower()
        )
        
        return df
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return pd.DataFrame()

# Load data khi server start
PRODUCTS_DF = load_healthcare_data()

# ==================== ML MODEL ====================
class ProductRecommender:
    def __init__(self, products_df):
        self.df = products_df
        # BỎ stop_words hoặc chỉ dùng stop_words='english' cho từ tiếng Anh
        self.tfidf = TfidfVectorizer(stop_words='english', max_features=1000)
        self.feature_matrix = None
        self._train_model()
    
    def _train_model(self):
        """Train TF-IDF model"""
        if len(self.df) > 0:
            try:
                self.feature_matrix = self.tfidf.fit_transform(self.df['features'])
                print(f"✅ ML Model trained with {self.feature_matrix.shape[1]} features")
            except Exception as e:
                print(f"❌ Error training model: {e}")
                # Fallback: không dùng TF-IDF
                self.feature_matrix = None
        else:
            print("⚠️ No data to train model")
    
    def search_products(self, query, limit=20):
        """Tìm kiếm sản phẩm - SIMPLE VERSION"""
        if len(self.df) == 0:
            return []
        
        query_lower = query.lower()
        
        # Đơn giản: tìm kiếm trực tiếp
        results = []
        for idx, row in self.df.iterrows():
            score = 0
            
            # Kiểm tra trong các trường
            fields_to_check = ['name', 'category', 'description', 'health_goal', 'features']
            
            for field in fields_to_check:
                if query_lower in str(row[field]).lower():
                    # Cho điểm khác nhau cho từng trường
                    if field == 'name':
                        score += 5
                    elif field == 'category':
                        score += 3
                    else:
                        score += 1
            
            # Kiểm tra từng từ trong query
            words = query_lower.split()
            for word in words:
                if len(word) > 2:
                    for field in fields_to_check:
                        if word in str(row[field]).lower():
                            score += 0.5
            
            if score > 0:
                product = row.to_dict()
                product['relevance'] = score
                product['match_score'] = min(score * 10, 100) if score < 10 else 100
                results.append(product)
        
        # Sắp xếp theo score
        results.sort(key=lambda x: x['relevance'], reverse=True)
        return results[:limit]
    
    def get_personalized_recommendations(self, user_profile, view_history=[], search_history=[], limit=10):
        """Gợi ý cá nhân hóa - SIMPLE VERSION"""
        if len(self.df) == 0:
            return []
        
        # Tạo query từ profile
        queries = []
        
        if user_profile:
            health_concerns = user_profile.get('health_concerns', '')
            diseases = user_profile.get('diseases', '')
            if health_concerns:
                queries.append(health_concerns)
            if diseases:
                queries.append(diseases)
        
        # Thêm search history
        queries.extend(search_history[-3:])
        
        # Nếu không có query, trả về random products
        if not queries:
            return self.get_popular_products(limit)
        
        # Tìm kiếm với tất cả queries
        all_results = []
        seen_ids = set()
        
        for query in queries:
            results = self.search_products(query, limit * 2)
            for product in results:
                if product['id'] not in seen_ids and product['id'] not in view_history:
                    all_results.append(product)
                    seen_ids.add(product['id'])
        
        # Sắp xếp và giới hạn
        all_results.sort(key=lambda x: x['relevance'], reverse=True)
        return all_results[:limit]
    
    def get_popular_products(self, limit=10):
        """Lấy sản phẩm phổ biến"""
        if len(self.df) == 0:
            return []
        
        # Trong thực tế sẽ dựa trên lượt xem/đánh giá
        # Tạm thời lấy ngẫu nhiên nhưng ưu tiên có health_goal
        df_with_goal = self.df[self.df['health_goal'].str.len() > 0]
        if len(df_with_goal) >= limit:
            return df_with_goal.sample(limit).to_dict('records')
        else:
            return self.df.sample(min(limit, len(self.df))).to_dict('records')
    
    def get_product_by_id(self, product_id):
        """Lấy chi tiết sản phẩm"""
        if len(self.df) == 0:
            return None
        
        product = self.df[self.df['id'] == product_id]
        if not product.empty:
            return product.iloc[0].to_dict()
        return None
    
    def get_categories(self, top_n=4):
        """Lấy danh mục nổi bật"""
        if len(self.df) == 0:
            return []
        
        # Đếm số sản phẩm theo category
        category_counts = self.df['category'].value_counts()
        top_categories = category_counts.head(top_n).index.tolist()
        
        # Lấy sản phẩm tiêu biểu cho mỗi category
        result = []
        for category in top_categories:
            category_products = self.df[self.df['category'] == category]
            if len(category_products) > 0:
                representative = category_products.iloc[0].to_dict()
                result.append({
                    'category': category,
                    'count': int(category_counts[category]),
                    'featured_product': representative
                })
        
        return result

# Khởi tạo recommender
recommender = ProductRecommender(PRODUCTS_DF)

# ==================== AUTH APIs ====================
@app.route('/auth/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        
        if not email or not data.get('password') or not data.get('name'):
            return jsonify({"message": "Thiếu thông tin bắt buộc"}), 400
            
        if email in USERS:
            return jsonify({"message": "Email đã tồn tại"}), 400
        
        # Tạo user mới
        USERS[email] = {
            "password": data.get('password'),
            "name": data.get('name'),
            "profile": None,
            "created_at": datetime.now().isoformat()
        }
        
        return jsonify({
            "status": "success",
            "user": {
                "email": email,
                "name": data.get('name'),
                "profile": None
            }
        })
        
    except Exception as e:
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

@app.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        print(f"📨 Login request data: {data}")
        
        email = None
        password = None
        
        # Case 1: Normal format {"email": "xxx", "password": "xxx"}
        if isinstance(data, dict):
            # Check if email field exists and is a string
            if 'email' in data and isinstance(data['email'], str):
                email = data['email'].strip().lower()
            # Check if email is a nested object (frontend bug)
            elif 'email' in data and isinstance(data['email'], dict):
                nested = data['email']
                if 'email' in nested and isinstance(nested['email'], str):
                    email = nested['email'].strip().lower()
                    print(f"⚠️ Extracted email from nested object: {email}")
                else:
                    # Try to get any string value from the object
                    for key, value in nested.items():
                        if isinstance(value, str) and '@' in value:
                            email = value.strip().lower()
                            print(f"⚠️ Found email in nested object key '{key}': {email}")
                            break
            
            # Get password
            if 'password' in data:
                password = data['password']
        
        print(f"🔐 Final extracted - Email: {email}, Has password: {bool(password)}")
        
        if not email:
            return jsonify({"message": "Vui lòng nhập email"}), 400
        
        if not password:
            return jsonify({"message": "Vui lòng nhập mật khẩu"}), 400
        
        user = USERS.get(email)
        
        if user and user['password'] == password:
            print(f"✅ Login success for: {email}")
            return jsonify({
                "status": "success",
                "user": {
                    "email": email,
                    "name": user['name'],
                    "profile": user['profile']
                }
            })
        
        print(f"❌ Login failed for: {email}")
        return jsonify({"message": "Sai email hoặc mật khẩu"}), 401
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Lỗi server: {str(e)}"}), 500
@app.route('/user/profile', methods=['POST', 'OPTIONS'])
def save_profile():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({"message": "Thiếu email"}), 400
            
        user = USERS.get(email)
        if not user:
            return jsonify({"message": "User không tồn tại"}), 404
        
        # Tạo profile
        profile = {
            "age": data.get('age'),
            "weight": data.get('weight'),
            "health_concerns": data.get('health_concerns', ''),
            "diseases": data.get('diseases', data.get('health_concerns', '')),
            "updated_at": datetime.now().isoformat()
        }
        
        # Cập nhật user
        user['profile'] = profile
        
        return jsonify({
            "status": "success",
            "message": "Đã lưu profile thành công",
            "profile": profile
        })
        
    except Exception as e:
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

# ==================== PRODUCT APIs ====================
@app.route('/api/products/search', methods=['POST', 'OPTIONS'])
def search_products():
    """Tìm kiếm sản phẩm"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        query = data.get('query', '').strip()
        email = data.get('email', '').strip().lower()
        limit = data.get('limit', 20)
        
        if not query:
            return jsonify({"message": "Vui lòng nhập từ khóa tìm kiếm"}), 400
        
        print(f"🔍 Searching for: '{query}'")
        
        # Lưu lịch sử tìm kiếm
        if email:
            USER_SEARCH_HISTORY[email].append(query)
            # Giữ tối đa 20 search gần nhất
            USER_SEARCH_HISTORY[email] = USER_SEARCH_HISTORY[email][-20:]
        
        # Tìm kiếm
        results = recommender.search_products(query, limit)
        
        print(f"✅ Found {len(results)} products")
        
        return jsonify({
            "status": "success",
            "query": query,
            "count": len(results),
            "products": results
        })
        
    except Exception as e:
        print(f"❌ Search error: {e}")
        return jsonify({"message": f"Lỗi tìm kiếm: {str(e)}"}), 500

@app.route('/api/products/personalized', methods=['POST', 'OPTIONS'])
def get_personalized_recommendations():
    """Gợi ý sản phẩm cá nhân hóa"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        limit = data.get('limit', 10)
        
        if not email:
            return jsonify({"message": "Vui lòng đăng nhập"}), 401
        
        user = USERS.get(email)
        if not user:
            return jsonify({"message": "User không tồn tại"}), 404
        
        print(f"🎯 Getting personalized recommendations for: {email}")
        
        # Lấy thông tin
        user_profile = user.get('profile')
        view_history = USER_VIEW_HISTORY.get(email, [])
        search_history = USER_SEARCH_HISTORY.get(email, [])
        
        print(f"   - Has profile: {user_profile is not None}")
        print(f"   - View history: {len(view_history)} products")
        print(f"   - Search history: {len(search_history)} queries")
        
        # Lấy recommendations
        recommendations = recommender.get_personalized_recommendations(
            user_profile, view_history, search_history, limit
        )
        
        print(f"✅ Generated {len(recommendations)} recommendations")
        
        return jsonify({
            "status": "success",
            "count": len(recommendations),
            "recommendations": recommendations,
            "based_on": {
                "has_profile": user_profile is not None,
                "view_history_count": len(view_history),
                "search_history_count": len(search_history)
            }
        })
        
    except Exception as e:
        print(f"❌ Personalized error: {e}")
        return jsonify({"message": f"Lỗi gợi ý: {str(e)}"}), 500

@app.route('/api/products/landing', methods=['GET', 'OPTIONS'])
def get_landing_page_data():
    """Lấy dữ liệu cho trang chủ"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        print("🏠 Getting landing page data")
        
        # 1. Danh mục nổi bật
        categories = recommender.get_categories(4)
        
        # 2. Sản phẩm phổ biến
        popular_products = recommender.get_popular_products(8)
        
        # 3. Danh sách sản phẩm gợi ý chung
        general_recommendations = recommender.get_popular_products(6)
        
        print(f"✅ Landing page data: {len(categories)} categories, {len(popular_products)} popular products")
        
        return jsonify({
            "status": "success",
            "categories": categories,
            "popular_products": popular_products,
            "general_recommendations": general_recommendations,
            "total_products": len(PRODUCTS_DF) if PRODUCTS_DF is not None else 0
        })
        
    except Exception as e:
        print(f"❌ Landing page error: {e}")
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

@app.route('/api/products/<int:product_id>', methods=['GET', 'OPTIONS'])
def get_product_detail(product_id):
    """Lấy chi tiết sản phẩm"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        print(f"📦 Getting product detail for ID: {product_id}")
        product = recommender.get_product_by_id(product_id)
        
        if not product:
            return jsonify({"message": "Sản phẩm không tồn tại"}), 404
        
        return jsonify({
            "status": "success",
            "product": product
        })
        
    except Exception as e:
        print(f"❌ Product detail error: {e}")
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

@app.route('/api/products/view', methods=['POST', 'OPTIONS'])
def track_product_view():
    """Lưu lịch sử xem sản phẩm"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        product_id = data.get('product_id')
        
        if not email:
            return jsonify({"message": "Vui lòng đăng nhập"}), 401
        
        if not product_id:
            return jsonify({"message": "Thiếu product_id"}), 400
        
        print(f"👁️ Tracking view: {email} viewed product {product_id}")
        
        # Thêm vào lịch sử xem (không trùng)
        if product_id not in USER_VIEW_HISTORY[email]:
            USER_VIEW_HISTORY[email].append(product_id)
            # Giữ tối đa 50 sản phẩm gần nhất
            USER_VIEW_HISTORY[email] = USER_VIEW_HISTORY[email][-50:]
        
        print(f"   View history for {email}: {len(USER_VIEW_HISTORY[email])} products")
        
        return jsonify({
            "status": "success",
            "message": "Đã lưu lịch sử xem",
            "view_count": len(USER_VIEW_HISTORY[email])
        })
        
    except Exception as e:
        print(f"❌ Track view error: {e}")
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

@app.route('/api/products/view-history', methods=['POST', 'OPTIONS'])
def get_view_history():
    """Lấy lịch sử xem sản phẩm"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({"message": "Vui lòng đăng nhập"}), 401
        
        print(f"📚 Getting view history for: {email}")
        
        view_history_ids = USER_VIEW_HISTORY.get(email, [])
        
        # Lấy thông tin sản phẩm
        viewed_products = []
        for product_id in view_history_ids[::-1]:  # Đảo ngược để lấy mới nhất trước
            product = recommender.get_product_by_id(product_id)
            if product:
                viewed_products.append(product)
        
        print(f"✅ Found {len(viewed_products)} viewed products")
        
        return jsonify({
            "status": "success",
            "count": len(viewed_products),
            "products": viewed_products
        })
        
    except Exception as e:
        print(f"❌ View history error: {e}")
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

@app.route('/api/products/similar/<int:product_id>', methods=['GET', 'OPTIONS'])
def get_similar_products(product_id):
    """Lấy sản phẩm tương tự"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        print(f"🔄 Getting similar products for: {product_id}")
        product = recommender.get_product_by_id(product_id)
        if not product:
            return jsonify({"message": "Sản phẩm không tồn tại"}), 404
        
        # Sử dụng category để tìm sản phẩm tương tự
        category = product.get('category', '')
        if category:
            # Lấy sản phẩm cùng category
            same_category = recommender.df[recommender.df['category'] == category]
            # Loại bỏ sản phẩm hiện tại
            same_category = same_category[same_category['id'] != product_id]
            
            similar = same_category.sample(min(5, len(same_category))).to_dict('records')
            
            print(f"✅ Found {len(similar)} similar products")
            
            return jsonify({
                "status": "success",
                "count": len(similar),
                "similar_products": similar
            })
        else:
            return jsonify({
                "status": "success",
                "count": 0,
                "similar_products": []
            })
        
    except Exception as e:
        print(f"❌ Similar products error: {e}")
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

@app.route('/api/products/categories', methods=['GET', 'OPTIONS'])
def get_all_categories():
    """Lấy tất cả danh mục"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        if PRODUCTS_DF is None or len(PRODUCTS_DF) == 0:
            return jsonify({"categories": []})
        
        categories = PRODUCTS_DF['category'].unique().tolist()
        return jsonify({
            "status": "success",
            "count": len(categories),
            "categories": categories
        })
        
    except Exception as e:
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

# ==================== HEALTH CHECK ====================
@app.route('/health', methods=['GET'])
def health_check():
    """Kiểm tra tình trạng server"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "data": {
            "products_loaded": len(PRODUCTS_DF) if PRODUCTS_DF is not None else 0,
            "users_count": len(USERS),
            "categories_count": len(PRODUCTS_DF['category'].unique()) if PRODUCTS_DF is not None else 0
        }
    })

@app.route('/debug/users', methods=['GET'])
def debug_users():
    """Debug endpoint - xem users"""
    return jsonify({
        "users": {email: {"name": user["name"], "has_profile": user["profile"] is not None} 
                 for email, user in USERS.items()},
        "view_history_counts": {email: len(views) for email, views in USER_VIEW_HISTORY.items()},
        "search_history_counts": {email: len(searches) for email, searches in USER_SEARCH_HISTORY.items()}
    })

# ==================== MAIN ====================
if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Healthcare Product Recommendation API")
    print("=" * 60)
    print(f"📦 Products loaded: {len(PRODUCTS_DF)}")
    
    if len(PRODUCTS_DF) > 0:
        print(f"🏷️  Categories: {len(PRODUCTS_DF['category'].unique())}")
        print(f"📝 Sample products:")
        for i in range(min(3, len(PRODUCTS_DF))):
            print(f"   {i+1}. {PRODUCTS_DF.iloc[i]['name']} ({PRODUCTS_DF.iloc[i]['category']})")
    
    print(f"🌐 Server running on: http://localhost:5000")
    print("=" * 60)
    print("\n📋 Available APIs:")
    print("  AUTH:")
    print("    POST /auth/signup")
    print("    POST /auth/login")
    print("    POST /user/profile")
    print("\n  PRODUCTS:")
    print("    POST /api/products/search")
    print("    POST /api/products/personalized")
    print("    GET  /api/products/landing")
    print("    GET  /api/products/<id>")
    print("    POST /api/products/view")
    print("    POST /api/products/view-history")
    print("    GET  /api/products/similar/<id>")
    print("    GET  /api/products/categories")
    print("\n  UTILITY:")
    print("    GET  /health")
    print("    GET  /debug/users")
    
    app.run(host='0.0.0.0', port=5000, debug=True)