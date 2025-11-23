from PIL import Image

source_path = r"C:/Users/unodu/.gemini/antigravity/brain/642bb2d4-1183-4ca0-8d99-e0a4804c03f7/jaspion_helmet_icon_1763922932498.png"
target_path = r"d:\ADS4NB\Transporte_Escolar_2025\public\images\jaspion_icon.png"

def remove_background(img, threshold=200):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    
    # Get background color from top-left pixel
    bg_color = img.getpixel((0, 0))
    
    for item in datas:
        # Calculate distance from white or background color
        # Assuming background is light/white
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    return img

try:
    img = Image.open(source_path)
    
    # Remove background
    img = remove_background(img)
    
    # Crop to content
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Resize to 64x64 (standard icon size)
    img.thumbnail((64, 64), Image.Resampling.LANCZOS)
    
    # Save as PNG
    img.save(target_path, "PNG")
    print(f"Successfully saved transparent icon to {target_path}")
    
except Exception as e:
    print(f"Error: {e}")
