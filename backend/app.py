from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime
import numpy as np
from collections import defaultdict
import json
import os

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
        df = pd.read_csv('healthcare_data.csv', encoding='utf-8-sig')
        print(f"Loaded {len(df)} products")
        
        # Chuẩn hóa dữ liệu
        df = df.fillna('')
        
        # Đảm bảo các trường mới tồn tại
        if 'age_range' not in df.columns:
            df['age_range'] = '18-65'
        if 'weight_range' not in df.columns:
            df['weight_range'] = '45-90'
        
        # Tạo features cho ML với các trường mới
        df['features'] = (
            df['name'].str.lower() + " " + 
            df['category'].str.lower() + " " + 
            df['description'].str.lower() + " " + 
            df['target_gender'].str.lower() + " " + 
            df['health_goal'].str.lower() + " " +
            df['age_range'].astype(str) + " " +
            df['weight_range'].astype(str)
        )
        
        print(f"📊 Data sample:")
        print(f"  - Categories: {df['category'].unique()[:10]}")
        print(f"  - Target genders: {df['target_gender'].unique()}")
        print(f"  - Age ranges: {df['age_range'].unique()[:5]}")
        
        return df
        
    except Exception as e:
        print(f"Error loading data: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()

# Load data khi server start
PRODUCTS_DF = load_healthcare_data()

# ==================== ML MODEL ====================
class ProductRecommender:
    def __init__(self, products_df):
        """Khởi tạo với dữ liệu sản phẩm"""
        self.df = products_df
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.feature_matrix = None
        self._fit_model()
    
    def _fit_model(self):
        """Huấn luyện model TF-IDF"""
        if len(self.df) > 0:
            self.feature_matrix = self.vectorizer.fit_transform(self.df['features'])
            print(f"TF-IDF model trained with {self.feature_matrix.shape[1]} features")
        else:
            print("⚠️ No data to train model")
    
    def search_products(self, query, limit=20):
        """Tìm kiếm sản phẩm bằng TF-IDF"""
        if len(self.df) == 0 or self.feature_matrix is None:
            print("No data or model not trained")
            return []
        
        try:
            print(f"🔍 Searching for: '{query}' (limit: {limit})")
            
            # Vectorize query
            query_vector = self.vectorizer.transform([query.lower()])
            
            # Tính similarity
            similarities = cosine_similarity(query_vector, self.feature_matrix).flatten()
            
            # Lấy top k results
            top_indices = similarities.argsort()[-limit:][::-1]
            
            results = []
            for idx in top_indices:
                if similarities[idx] > 0.01:  # Chỉ lấy kết quả có similarity > 0.01
                    product = self.df.iloc[idx].to_dict()
                    
                    # Đảm bảo có id
                    if 'id' not in product:
                        product['id'] = int(idx) + 1
                    
                    # Thêm scores
                    product['relevance'] = float(similarities[idx])
                    product['match_score'] = float(similarities[idx])
                    
                    # Format đúng type
                    product['id'] = int(product['id'])
                    
                    results.append(product)
            
            print(f"Found {len(results)} results with similarity > 0.01")
            return results
            
        except Exception as e:
            print(f"Search products error: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def recommend(self, user_input, limit=20):
        """Gợi ý sản phẩm dựa trên user input"""
        if len(self.df) == 0:
            return []
        
        try:
            # Tạo query từ user input
            query_parts = []
            
            # Thêm health goals
            if 'health_goals' in user_input:
                query_parts.extend(user_input['health_goals'])
            
            # Thêm symptoms
            if 'symptoms' in user_input:
                query_parts.extend(user_input['symptoms'])
            
            # Tạo query string
            query = ' '.join(query_parts)
            
            # Nếu không có query, trả về popular products
            if not query.strip():
                print("ℹ️ No query, returning popular products")
                return self.get_popular_products(limit)
            
            # Tìm kiếm bằng TF-IDF
            results = self.search_products(query, limit)
            
            # Filter by demographics nếu cần
            gender = user_input.get('gender', 'All').lower()
            if gender != 'all':
                filtered_results = []
                for product in results:
                    product_gender = str(product.get('target_gender', 'All')).lower()
                    if product_gender == 'all' or product_gender == gender:
                        filtered_results.append(product)
                results = filtered_results[:limit]
            
            return results
            
        except Exception as e:
            print(f"Recommend error: {e}")
            return self.get_popular_products(limit)
    
    def get_product_by_id(self, product_id):
        """Lấy chi tiết sản phẩm"""
        if len(self.df) == 0:
            return None
        
        try:
            # Chuyển đổi product_id sang int nếu cần
            if isinstance(product_id, str):
                product_id = int(product_id)
            
            # Tìm sản phẩm
            product_row = self.df[self.df['id'] == product_id]
            
            if not product_row.empty:
                product = product_row.iloc[0].to_dict()
                
                # Đảm bảo id là int
                product['id'] = int(product['id'])
                
                # Thêm thông tin bổ sung
                product['has_age_range'] = 'age_range' in product and product['age_range'] != ''
                product['has_weight_range'] = 'weight_range' in product and product['weight_range'] != ''
                
                return product
            
            print(f"Product ID {product_id} not found")
            return None
            
        except Exception as e:
            print(f"Error getting product by id: {e}")
            return None
    
    def get_categories(self, limit=None):
        """Lấy danh sách categories"""
        if len(self.df) == 0:
            return []
        
        categories = self.df['category'].unique().tolist()
        if limit:
            return categories[:limit]
        return categories
    
    def get_popular_products(self, limit=10):
        """Lấy sản phẩm phổ biến (mẫu)"""
        if len(self.df) == 0:
            return []
        
        try:
            # Lấy ngẫu nhiên limit sản phẩm
            sample_size = min(limit, len(self.df))
            sample_df = self.df.sample(sample_size)
            products = sample_df.to_dict('records')
            
            # Thêm relevance và match_score
            for product in products:
                product['relevance'] = 0.8
                product['match_score'] = 0.7
                product['id'] = int(product['id'])
            
            return products
            
        except Exception as e:
            print(f"Error getting popular products: {e}")
            return []
    
    def get_personalized_recommendations(self, user_profile, view_history, search_history, limit=10):
        """Gợi ý cá nhân hóa"""
        if len(self.df) == 0:
            return []
        
        try:
            # Tạo query từ search history
            query = ' '.join(search_history[-3:]) if search_history else ''
            
            if not query and user_profile:
                # Sử dụng health concerns từ profile
                query = user_profile.get('health_concerns', '') or user_profile.get('diseases', '')
            
            if query:
                # Tìm kiếm dựa trên query
                results = self.search_products(query, limit * 2)
            else:
                # Nếu không có query, lấy popular products
                results = self.get_popular_products(limit * 2)
            
            # Filter out viewed products
            if view_history:
                results = [p for p in results if p['id'] not in view_history]
            
            # Limit results
            return results[:limit]
            
        except Exception as e:
            print(f"Error getting personalized recommendations: {e}")
            return self.get_popular_products(limit)

# Khởi tạo recommender
if not PRODUCTS_DF.empty:
    recommender = ProductRecommender(PRODUCTS_DF)
    print("Recommender initialized successfully")
else:
    recommender = None
    print("⚠️ Recommender not initialized due to empty data")

# ==================== HELPER FUNCTIONS ====================
def save_search_history(history):
    """Lưu lịch sử tìm kiếm"""
    try:
        # Tạo thư mục nếu chưa tồn tại
        os.makedirs('data', exist_ok=True)
        
        # Lưu vào file JSON
        history_file = 'data/search_history.json'
        
        # Đọc lịch sử hiện có
        if os.path.exists(history_file):
            with open(history_file, 'r', encoding='utf-8') as f:
                histories = json.load(f)
        else:
            histories = []
        
        # Thêm lịch sử mới
        histories.append(history)
        
        # Giới hạn số lượng bản ghi
        if len(histories) > 1000:
            histories = histories[-1000:]
        
        # Lưu file
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(histories, f, ensure_ascii=False, indent=2)
            
        print(f"Saved search history for {history['email']}")
        
    except Exception as e:
        print(f"⚠️ Error saving search history: {e}")

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
        print(f"Signup error: {e}")
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
            print(f"Login success for: {email}")
            return jsonify({
                "status": "success",
                "user": {
                    "email": email,
                    "name": user['name'],
                    "profile": user['profile']
                }
            })
        
        print(f"Login failed for: {email}")
        return jsonify({"message": "Sai email hoặc mật khẩu"}), 401
        
    except Exception as e:
        print(f"Login error: {e}")
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
        print(f"Save profile error: {e}")
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

# ==================== PRODUCT APIs ====================
@app.route('/api/products/search', methods=['POST', 'OPTIONS'])
def search_products():
    """API tìm kiếm sản phẩm"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        email = data.get('email', '').strip().lower()
        limit = data.get('limit', 20)
        
        if not query:
            return jsonify({
                'success': False,
                'message': 'Vui lòng nhập từ khóa tìm kiếm'
            }), 400
        
        print(f"🔍 Search request: query='{query}', email='{email}', limit={limit}")
        
        # Kiểm tra recommender
        if recommender is None:
            print("Recommender is None")
            return jsonify({
                'success': False,
                'error': 'Recommender not initialized'
            }), 500
        
        if PRODUCTS_DF.empty:
            print("PRODUCTS_DF is empty")
            return jsonify({
                'success': False,
                'error': 'No products data available'
            }), 500
        
        # Lưu lịch sử tìm kiếm
        search_history_data = None
        if email:
            # Update in-memory history
            USER_SEARCH_HISTORY[email].append(query)
            USER_SEARCH_HISTORY[email] = USER_SEARCH_HISTORY[email][-20:]
            
            # Prepare for file saving
            search_history_data = {
                'email': email,
                'query': query,
                'timestamp': datetime.now().isoformat(),
                'results_count': 0
            }
        
        # Tìm kiếm sản phẩm
        print(f"🔍 Executing search for: '{query}'")
        results = recommender.search_products(query, limit)
        
        # Cập nhật results count trong history
        if search_history_data:
            search_history_data['results_count'] = len(results)
            try:
                save_search_history(search_history_data)
            except Exception as e:
                print(f"⚠️ Could not save search history: {e}")
        
        print(f"Search completed. Found {len(results)} products")
        
        return jsonify({
            'success': True,
            'status': 'success',
            'query': query,
            'count': len(results),
            'products': results
        })
            
    except Exception as e:
        print(f"Search error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'status': 'error',
            'message': f'Lỗi tìm kiếm: {str(e)}'
        }), 500

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
        
        print(f"Generated {len(recommendations)} recommendations")
        
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
        print(f"Personalized error: {e}")
        return jsonify({"message": f"Lỗi gợi ý: {str(e)}"}), 500

@app.route('/api/products/landing', methods=['GET', 'OPTIONS'])
def get_landing_page_data():
    """Lấy dữ liệu cho trang chủ"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        print(" Getting landing page data")
        
        # 1. Danh mục nổi bật
        categories = recommender.get_categories(4) if recommender else []
        
        # 2. Sản phẩm phổ biến
        popular_products = recommender.get_popular_products(8) if recommender else []
        
        # 3. Danh sách sản phẩm gợi ý chung
        general_recommendations = recommender.get_popular_products(6) if recommender else []
        
        print(f"Landing page data: {len(categories)} categories, {len(popular_products)} popular products")
        
        return jsonify({
            "status": "success",
            "categories": categories,
            "popular_products": popular_products,
            "general_recommendations": general_recommendations,
            "total_products": len(PRODUCTS_DF) if PRODUCTS_DF is not None else 0
        })
        
    except Exception as e:
        print(f"Landing page error: {e}")
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

@app.route('/api/products/<int:product_id>', methods=['GET', 'OPTIONS'])
def get_product_detail(product_id):
    """Lấy chi tiết sản phẩm"""
    if request.method == 'OPTIONS':
        print(f"OPTIONS request for product {product_id}")
        return '', 200
    
    try:
        print(f"Getting product detail for ID: {product_id}")
        
        if recommender is None:
            return jsonify({
                "status": "error",
                "message": "Recommender not initialized"
            }), 500
        
        product = recommender.get_product_by_id(product_id)
        
        if not product:
            return jsonify({
                "status": "error",
                "message": f"Sản phẩm ID {product_id} không tồn tại"
            }), 404
        
        print(f"Found product: {product.get('name', 'Unknown')}")
        return jsonify({
            "status": "success",
            "product": product
        })
        
    except Exception as e:
        print(f"Product detail error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": f"Lỗi server: {str(e)}"
        }), 500

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
            USER_VIEW_HISTORY[email] = USER_VIEW_HISTORY[email][-50:]
        
        print(f"   View history for {email}: {len(USER_VIEW_HISTORY[email])} products")
        
        return jsonify({
            "status": "success",
            "message": "Đã lưu lịch sử xem",
            "view_count": len(USER_VIEW_HISTORY[email])
        })
        
    except Exception as e:
        print(f"Track view error: {e}")
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
        
        print(f"Getting view history for: {email}")
        
        view_history_ids = USER_VIEW_HISTORY.get(email, [])
        
        # Lấy thông tin sản phẩm
        viewed_products = []
        for product_id in view_history_ids[::-1]:
            product = recommender.get_product_by_id(product_id) if recommender else None
            if product:
                viewed_products.append(product)
        
        print(f"Found {len(viewed_products)} viewed products")
        
        return jsonify({
            "status": "success",
            "count": len(viewed_products),
            "products": viewed_products
        })
        
    except Exception as e:
        print(f"View history error: {e}")
        return jsonify({"message": f"Lỗi: {str(e)}"}), 500

@app.route('/api/products/similar/<int:product_id>', methods=['GET', 'OPTIONS'])
def get_similar_products(product_id):
    """Lấy sản phẩm tương tự"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        print(f"Getting similar products for: {product_id}")
        
        if recommender is None:
            return jsonify({
                "status": "error",
                "message": "Recommender not initialized"
            }), 500
        
        product = recommender.get_product_by_id(product_id)
        if not product:
            return jsonify({"message": "Sản phẩm không tồn tại"}), 404
        
        # Sử dụng category để tìm sản phẩm tương tự
        category = product.get('category', '')
        if category:
            same_category = recommender.df[recommender.df['category'] == category]
            same_category = same_category[same_category['id'] != product_id]
            
            similar = same_category.sample(min(5, len(same_category))).to_dict('records')
            
            print(f"Found {len(similar)} similar products")
            
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
        print(f"Similar products error: {e}")
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
        print(f"Categories error: {e}")
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
            "categories_count": len(PRODUCTS_DF['category'].unique()) if PRODUCTS_DF is not None else 0,
            "recommender_initialized": recommender is not None
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

@app.route('/debug/data', methods=['GET'])
def debug_data():
    """Debug endpoint để kiểm tra dữ liệu"""
    if PRODUCTS_DF is None:
        return jsonify({"message": "PRODUCTS_DF is None"})
    
    # Lấy thông tin chi tiết
    info = {
        "total_rows": len(PRODUCTS_DF),
        "columns": PRODUCTS_DF.columns.tolist(),
        "id_column_info": {
            "dtype": str(PRODUCTS_DF['id'].dtype),
            "min": int(PRODUCTS_DF['id'].min()) if len(PRODUCTS_DF) > 0 else None,
            "max": int(PRODUCTS_DF['id'].max()) if len(PRODUCTS_DF) > 0 else None,
            "unique_count": PRODUCTS_DF['id'].nunique(),
            "sample_values": PRODUCTS_DF['id'].head(20).tolist()
        },
        "has_id_1": 1 in PRODUCTS_DF['id'].values,
        "row_with_id_1": PRODUCTS_DF[PRODUCTS_DF['id'] == 1].to_dict('records') if len(PRODUCTS_DF[PRODUCTS_DF['id'] == 1]) > 0 else [],
        "recommender_status": "initialized" if recommender else "not initialized"
    }
    
    return jsonify(info)

# ==================== MAIN ====================
if __name__ == '__main__':
    print("=" * 60)
    print("Healthcare Product Recommendation API")
    print("=" * 60)
    print(f"Products loaded: {len(PRODUCTS_DF)}")
    
    if len(PRODUCTS_DF) > 0:
        print(f" Categories: {len(PRODUCTS_DF['category'].unique())}")
        print(f"Sample products:")
        for i in range(min(3, len(PRODUCTS_DF))):
            print(f"   {i+1}. {PRODUCTS_DF.iloc[i]['name']} ({PRODUCTS_DF.iloc[i]['category']})")
    
    print(f"Server running on: http://localhost:5000")
    print("=" * 60)
    print("\n Available APIs:")
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
    print("    GET  /debug/data")
    
    app.run(host='0.0.0.0', port=5000, debug=True)