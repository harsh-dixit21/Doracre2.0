from flask import Blueprint, request, jsonify
from firebase_admin import auth
import traceback

auth_bp = Blueprint('auth', __name__)

def verify_token(token):
    """Verify Firebase token"""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization token provided'}), 401
        
        # Extract token (format: "Bearer <token>")
        token = auth_header.split('Bearer ')[-1] if 'Bearer' in auth_header else auth_header
        
        # Verify token
        decoded_token = verify_token(token)
        
        if not decoded_token:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Return user data
        user_data = {
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email', ''),
            'name': decoded_token.get('name', decoded_token.get('email', '').split('@')[0])
        }
        
        return jsonify(user_data), 200
        
    except Exception as e:
        print(f"Profile error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
