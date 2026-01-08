from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
import os

# Initialize Flask
app = Flask(__name__)

# Configure CORS properly
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize Firebase Admin SDK
def initialize_firebase():
    try:
        # Path to service account key
        cred_path = os.path.join(os.path.dirname(__file__), 'config', 'serviceAccountKey.json')
        
        if not os.path.exists(cred_path):
            print("⚠️ WARNING: serviceAccountKey.json not found!")
            print(f"⚠️ Expected at: {cred_path}")
            return False
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
        return True
        
    except Exception as e:
        print(f"❌ Firebase Admin initialization failed: {e}")
        return False

# Initialize Firebase
firebase_initialized = initialize_firebase()

# Import routes
from routes.auth import auth_bp
from routes.prediction import predict_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(predict_bp, url_prefix='/api/predict')

@app.route('/')
def index():
    return {
        'message': 'Doracare API running ✅',
        'firebase': 'connected' if firebase_initialized else 'disconnected'
    }

@app.route('/health')
def health():
    return {
        'status': 'healthy',
        'firebase': firebase_initialized
    }, 200

if __name__ == '__main__':
    print("🚀 Starting Doracare backend...")
    print(f"🔥 Firebase Status: {'✅ Connected' if firebase_initialized else '❌ Not Connected'}")
    app.run(debug=True, port=5000, host='127.0.0.1')
