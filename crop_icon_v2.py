from PIL import Image

source_path = r"C:/Users/unodu/.gemini/antigravity/brain/642bb2d4-1183-4ca0-8d99-e0a4804c03f7/uploaded_image_1763922201498.png"
target_path = r"d:\ADS4NB\Transporte_Escolar_2025\public\images\jaspion_icon.png"

try:
    img = Image.open(source_path)
    width, height = img.size
    
    # The image contains 3 icons side by side.
    # We want the 3rd one (rightmost).
    
    # Assuming equal width for each section
    section_width = width // 3
    
    # The icon itself is likely a square within that section.
    # Let's define the crop box for the 3rd section.
    left = section_width * 2
    top = 0
    right = width
    bottom = height
    
    # Crop the section first
    section = img.crop((left, top, right, bottom))
    
    # Now we need to find the actual icon within this section.
    # Assuming the icon is centered and roughly square.
    # Let's crop a square from the center of this section.
    
    sec_w, sec_h = section.size
    min_dim = min(sec_w, sec_h)
    
    # Calculate center crop
    c_left = (sec_w - min_dim) // 2
    c_top = (sec_h - min_dim) // 2
    c_right = c_left + min_dim
    c_bottom = c_top + min_dim
    
    # Refine crop: The generated image usually has some padding/background.
    # We want to crop slightly inside to avoid edges if possible, or just take the square.
    # Let's take the center square.
    
    final_icon = section.crop((c_left, c_top, c_right, c_bottom))
    
    # Resize to a standard icon size (e.g., 128x128) for better performance and consistency
    final_icon = final_icon.resize((128, 128), Image.Resampling.LANCZOS)
    
    final_icon.save(target_path)
    print(f"Successfully saved re-cropped and resized icon to {target_path}")
    
except Exception as e:
    print(f"Error: {e}")
