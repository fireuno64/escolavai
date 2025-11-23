from PIL import Image
import os

source_path = r"C:/Users/unodu/.gemini/antigravity/brain/642bb2d4-1183-4ca0-8d99-e0a4804c03f7/uploaded_image_1763922201498.png"
target_path = r"d:\ADS4NB\Transporte_Escolar_2025\public\images\jaspion_icon.png"

try:
    img = Image.open(source_path)
    width, height = img.size
    
    # Calculate dimensions for the 3rd (rightmost) helmet
    # Assuming 3 equal sections
    section_width = width // 3
    
    # Crop the rightmost section
    # left, top, right, bottom
    left = section_width * 2
    top = 0
    right = width
    bottom = height
    
    cropped_img = img.crop((left, top, right, bottom))
    
    # Optional: Trim whitespace/transparent borders if needed, but for now just saving the section
    # It might be better to center crop a square from that section if it's not square
    
    # Let's resize to a standard icon size (e.g., 128x128) to ensure it fits well
    # But first, let's just save the crop to see
    
    cropped_img.save(target_path)
    print(f"Successfully saved cropped image to {target_path}")
    
except Exception as e:
    print(f"Error: {e}")
