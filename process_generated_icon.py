from PIL import Image, ImageDraw

source_path = r"C:/Users/unodu/.gemini/antigravity/brain/642bb2d4-1183-4ca0-8d99-e0a4804c03f7/jaspion_helmet_icon_1763922932498.png"
target_path = r"d:\ADS4NB\Transporte_Escolar_2025\public\images\jaspion_icon.png"

def remove_background_floodfill(img):
    img = img.convert("RGBA")
    width, height = img.size
    
    # Create a mask initialized to 0 (transparent)
    # We will flood fill the background on a temporary image to identify it
    
    # Seed points: corners
    seeds = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    # Use ImageDraw.floodfill to fill background with transparent
    # Note: PIL's floodfill fills a region with a color.
    # We want to make it transparent.
    
    # Let's verify if the corners are actually white/light
    # If not, we might be erasing content.
    # Assuming the generated icon has a white background.
    
    ImageDraw.floodfill(img, (0, 0), (255, 255, 255, 0), thresh=50)
    ImageDraw.floodfill(img, (width-1, 0), (255, 255, 255, 0), thresh=50)
    ImageDraw.floodfill(img, (0, height-1), (255, 255, 255, 0), thresh=50)
    ImageDraw.floodfill(img, (width-1, height-1), (255, 255, 255, 0), thresh=50)
    
    return img

try:
    img = Image.open(source_path)
    
    # Remove background
    img = remove_background_floodfill(img)
    
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
