from ultralytics import YOLO
import os
import cv2
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt

class SkinDiseaseDetector:
    def __init__(self, model_path='ml_model/best.pt'):
        """Initialize YOLOv8 model"""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        self.model = YOLO(model_path)
        self.class_names = self.model.names
        
    def predict(self, image_path, confidence_threshold=0.25):
        """
        Predict skin disease from image
        
        Args:
            image_path: Path to the image file
            confidence_threshold: Minimum confidence for predictions
            
        Returns:
            dict: Prediction results with detected diseases and confidence scores
        """
        try:
            # Run prediction
            results = self.model(image_path, conf=confidence_threshold)
            
            predictions = []
            for result in results:
                boxes = result.boxes
                
                for box in boxes:
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                    
                    predictions.append({
                        'class_id': class_id,
                        'class_name': self.class_names[class_id],
                        'confidence': confidence,
                        'bbox': bbox
                    })
            
            return {
                'success': True,
                'predictions': predictions,
                'num_detections': len(predictions)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_visualization(self, image_path, predictions, output_path='static/result.png'):
        """
        Create visualization with bounding boxes and labels
        
        Args:
            image_path: Path to original image
            predictions: List of prediction dictionaries
            output_path: Path to save visualization
            
        Returns:
            str: Path to saved visualization
        """
        try:
            # Read image
            img = cv2.imread(image_path)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Draw predictions
            for pred in predictions:
                bbox = pred['bbox']
                x1, y1, x2, y2 = map(int, bbox)
                label = f"{pred['class_name']}: {pred['confidence']:.2f}"
                
                # Draw rectangle
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                # Draw label background
                cv2.rectangle(img, (x1, y1 - 25), (x1 + len(label) * 10, y1), (0, 255, 0), -1)
                cv2.putText(img, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Save image
            img_rgb = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            cv2.imwrite(output_path, img_rgb)
            
            return output_path
            
        except Exception as e:
            print(f"Error creating visualization: {e}")
            return None
    
    def create_confidence_chart(self, predictions, output_path='static/chart.png'):
        """
        Create bar chart of prediction confidences
        
        Args:
            predictions: List of prediction dictionaries
            output_path: Path to save chart
            
        Returns:
            str: Path to saved chart
        """
        try:
            if not predictions:
                return None
            
            # Extract data
            labels = [pred['class_name'] for pred in predictions]
            confidences = [pred['confidence'] * 100 for pred in predictions]
            
            # Create figure
            plt.figure(figsize=(10, 6))
            colors = plt.cm.viridis(np.linspace(0, 1, len(labels)))
            
            bars = plt.bar(range(len(labels)), confidences, color=colors, edgecolor='black', linewidth=1.5)
            
            # Customize chart
            plt.xlabel('Detected Conditions', fontsize=12, fontweight='bold')
            plt.ylabel('Confidence (%)', fontsize=12, fontweight='bold')
            plt.title('Skin Disease Detection Results', fontsize=14, fontweight='bold', pad=20)
            plt.xticks(range(len(labels)), labels, rotation=45, ha='right')
            plt.ylim(0, 100)
            plt.grid(axis='y', alpha=0.3, linestyle='--')
            
            # Add value labels on bars
            for i, bar in enumerate(bars):
                height = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2., height + 2,
                        f'{confidences[i]:.1f}%',
                        ha='center', va='bottom', fontweight='bold')
            
            plt.tight_layout()
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Save chart
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            return output_path
            
        except Exception as e:
            print(f"Error creating chart: {e}")
            return None

# Initialize detector (singleton pattern)
_detector = None

def get_detector():
    """Get or create detector instance"""
    global _detector
    if _detector is None:
        _detector = SkinDiseaseDetector()
    return _detector
