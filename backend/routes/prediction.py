from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from utils.model_loader import get_detector
from utils.database import get_db

prediction_bp = Blueprint('prediction', __name__)

UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'static'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@prediction_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_and_predict():
    """Upload image and predict skin disease"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if file is present
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG allowed'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(filepath)
        
        # Get detector and make prediction
        detector = get_detector()
        result = detector.predict(filepath, confidence_threshold=0.25)
        
        if not result['success']:
            return jsonify({'error': result.get('error', 'Prediction failed')}), 500
        
        predictions = result['predictions']
        
        if not predictions:
            return jsonify({
                'message': 'No skin conditions detected',
                'predictions': [],
                'visualization_url': None,
                'chart_url': None
            }), 200
        
        # Create visualizations
        viz_path = os.path.join(RESULT_FOLDER, f'result_{timestamp}.png')
        chart_path = os.path.join(RESULT_FOLDER, f'chart_{timestamp}.png')
        
        detector.create_visualization(filepath, predictions, viz_path)
        detector.create_confidence_chart(predictions, chart_path)
        
        # Save to database
        conn = get_db()
        cursor = conn.cursor()
        
        # Get primary detection (highest confidence)
        primary_pred = max(predictions, key=lambda x: x['confidence'])
        
        cursor.execute(
            'INSERT INTO predictions (user_id, disease_name, confidence, image_path) VALUES (?, ?, ?, ?)',
            (current_user_id, primary_pred['class_name'], primary_pred['confidence'], filepath)
        )
        prediction_id = cursor.lastrowid
        
        # Save all detections
        for pred in predictions:
            cursor.execute(
                '''INSERT INTO prediction_details 
                   (prediction_id, class_name, confidence, bbox_x1, bbox_y1, bbox_x2, bbox_y2) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)''',
                (prediction_id, pred['class_name'], pred['confidence'], 
                 pred['bbox'][0], pred['bbox'][1], pred['bbox'][2], pred['bbox'][3])
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Prediction successful',
            'predictions': predictions,
            'primary_detection': {
                'disease': primary_pred['class_name'],
                'confidence': f"{primary_pred['confidence'] * 100:.2f}%"
            },
            'visualization_url': f'/api/predict/image/{os.path.basename(viz_path)}',
            'chart_url': f'/api/predict/image/{os.path.basename(chart_path)}',
            'prediction_id': prediction_id
        }), 200
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({'error': str(e)}), 500

@prediction_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's prediction history"""
    try:
        current_user_id = get_jwt_identity()
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            '''SELECT id, disease_name, confidence, created_at 
               FROM predictions 
               WHERE user_id = ? 
               ORDER BY created_at DESC 
               LIMIT 50''',
            (current_user_id,)
        )
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'id': row[0],
                'disease': row[1],
                'confidence': f"{row[2] * 100:.2f}%",
                'date': row[3]
            })
        
        conn.close()
        
        return jsonify({'history': history}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prediction_bp.route('/image/<filename>', methods=['GET'])
def get_image(filename):
    """Serve generated images"""
    try:
        filepath = os.path.join(RESULT_FOLDER, filename)
        if os.path.exists(filepath):
            return send_file(filepath, mimetype='image/png')
        return jsonify({'error': 'Image not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prediction_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get user statistics"""
    try:
        current_user_id = get_jwt_identity()
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Total predictions
        cursor.execute('SELECT COUNT(*) FROM predictions WHERE user_id = ?', (current_user_id,))
        total_predictions = cursor.fetchone()[0]
        
        # Most common disease
        cursor.execute(
            '''SELECT disease_name, COUNT(*) as count 
               FROM predictions 
               WHERE user_id = ? 
               GROUP BY disease_name 
               ORDER BY count DESC 
               LIMIT 1''',
            (current_user_id,)
        )
        most_common = cursor.fetchone()
        
        conn.close()
        
        return jsonify({
            'total_predictions': total_predictions,
            'most_common_disease': most_common[0] if most_common else None,
            'most_common_count': most_common[1] if most_common else 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
