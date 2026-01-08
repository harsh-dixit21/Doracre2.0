from flask import Blueprint, request, jsonify
from firebase_admin import auth
from werkzeug.utils import secure_filename
import os
import traceback
from ultralytics import YOLO

predict_bp = Blueprint('predict', __name__)

# Load model
model = YOLO('ml_model/best.pt')

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def verify_token(token):
    """Verify Firebase token"""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

@predict_bp.route('/upload', methods=['POST'])
def upload_image():
    """Upload and predict skin disease"""
    try:
        # Get token
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization token'}), 401
        
        token = auth_header.split('Bearer ')[-1] if 'Bearer' in auth_header else auth_header
        decoded_token = verify_token(token)
        
        if not decoded_token:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Check if file uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Run prediction
        results = model(filepath)
        
        # Parse results
        predictions = []
        for result in results:
            for box in result.boxes:
                predictions.append({
                    'class': result.names[int(box.cls[0])],
                    'confidence': float(box.conf[0]),
                    'bbox': box.xyxy[0].tolist()
                })
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'image_path': filepath
        }), 200
        
    except Exception as e:
        print(f"Upload error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@predict_bp.route('/history', methods=['GET'])
def get_history():
    """Get prediction history"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization token'}), 401
        
        token = auth_header.split('Bearer ')[-1] if 'Bearer' in auth_header else auth_header
        decoded_token = verify_token(token)
        
        if not decoded_token:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Return empty history for now (add database later)
        return jsonify({
            'history': []
        }), 200
        
    except Exception as e:
        print(f"History error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@predict_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get user statistics"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization token'}), 401
        
        token = auth_header.split('Bearer ')[-1] if 'Bearer' in auth_header else auth_header
        decoded_token = verify_token(token)
        
        if not decoded_token:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Return empty stats for now
        return jsonify({
            'total_scans': 0,
            'diseases_detected': 0
        }), 200
        
    except Exception as e:
        print(f"Stats error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
