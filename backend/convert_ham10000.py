import pandas as pd
import os
import shutil
from sklearn.model_selection import train_test_split
from PIL import Image

# Paths
metadata_path = "C:/Users/HARSH DIXIT/Downloads/HAM10000/HAM10000_metadata.csv"
images_folder1 = "C:/Users/HARSH DIXIT/Downloads/HAM10000/HAM10000_images_part_1"
images_folder2 = "C:/Users/HARSH DIXIT/Downloads/HAM10000/HAM10000_images_part_2"
output_folder = "C:/Users/HARSH DIXIT/Downloads/ham10000_yolo"

# Load metadata
df = pd.read_csv(metadata_path)

# Class mapping (0-6 for YOLO)
class_map = {
    'akiec': 0,  # Actinic keratoses
    'bcc': 1,    # Basal cell carcinoma
    'bkl': 2,    # Benign keratosis
    'df': 3,     # Dermatofibroma
    'mel': 4,    # Melanoma
    'nv': 5,     # Melanocytic nevi
    'vasc': 6    # Vascular lesions
}

# Create output folders
for split in ['train', 'val', 'test']:
    os.makedirs(f"{output_folder}/{split}/images", exist_ok=True)
    os.makedirs(f"{output_folder}/{split}/labels", exist_ok=True)

# Split data: 70% train, 20% val, 10% test
train_df, temp_df = train_test_split(df, test_size=0.3, random_state=42, stratify=df['dx'])
val_df, test_df = train_test_split(temp_df, test_size=0.33, random_state=42, stratify=temp_df['dx'])

print(f"Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")

# Process images
for split, data in [('train', train_df), ('val', val_df), ('test', test_df)]:
    for idx, row in data.iterrows():
        img_name = row['image_id'] + '.jpg'
        class_id = class_map[row['dx']]
        
        # Find image (could be in part_1 or part_2)
        src1 = os.path.join(images_folder1, img_name)
        src2 = os.path.join(images_folder2, img_name)
        
        src = src1 if os.path.exists(src1) else src2
        
        if os.path.exists(src):
            # Copy image
            dst = f"{output_folder}/{split}/images/{img_name}"
            shutil.copy(src, dst)
            
            # Get image dimensions
            img = Image.open(src)
            width, height = img.size
            
            # Create YOLO label (full image classification)
            # Format: class_id x_center y_center width height (normalized 0-1)
            label_path = f"{output_folder}/{split}/labels/{row['image_id']}.txt"
            with open(label_path, 'w') as f:
                f.write(f"{class_id} 0.5 0.5 1.0 1.0\n")
        
        if idx % 1000 == 0:
            print(f"Processed {idx}/{len(data)} images for {split}")

print("✅ Conversion complete!")

# Create data.yaml
yaml_content = f"""path: {output_folder.replace(chr(92), '/')}
train: train/images
val: val/images
test: test/images

nc: 7
names:
  0: akiec
  1: bcc
  2: bkl
  3: df
  4: mel
  5: nv
  6: vasc
"""

with open(f"{output_folder}/data.yaml", 'w') as f:
    f.write(yaml_content)

print(f"✅ data.yaml created at {output_folder}/data.yaml")
