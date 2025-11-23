from PIL import Image, ImageOps, ImageDraw, ImageChops

source_path = r"C:/Users/unodu/.gemini/antigravity/brain/642bb2d4-1183-4ca0-8d99-e0a4804c03f7/uploaded_image_1763922201498.png"
target_path = r"d:\ADS4NB\Transporte_Escolar_2025\public\images\jaspion_icon.png"

try:
    img = Image.open(source_path).convert("RGBA")
    width, height = img.size
    
    # 3rd section
    section_width = width // 3
    left = section_width * 2
    top = 0
    right = width
    bottom = height
    
    section = img.crop((left, top, right, bottom))
    
    # Find bounding box of non-white content
    # Convert to grayscale and threshold to find white background
    bg = Image.new("RGBA", section.size, (255, 255, 255, 255))
    diff = ImageChops.difference(section, bg)
    bbox = diff.getbbox()
    
    if bbox:
        icon = section.crop(bbox)
    else:
        # Fallback if bbox not found (e.g. image is all white? unlikely)
        # Just crop center
        s_w, s_h = section.size
        min_dim = min(s_w, s_h)
        c_left = (s_w - min_dim) // 2
        c_top = (s_h - min_dim) // 2
        icon = section.crop((c_left, c_top, c_left + min_dim, c_top + min_dim))

    # Resize to 128x128 for high quality, CSS will scale down
    icon = icon.resize((128, 128), Image.Resampling.LANCZOS)
    
    # Create circular mask
    mask = Image.new('L', (128, 128), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, 128, 128), fill=255)
    
    # Apply mask
    output = ImageOps.fit(icon, mask.size, centering=(0.5, 0.5))
    output.putalpha(mask)
    
    output.save(target_path)
    print(f"Successfully saved circular icon to {target_path}")
    
except Exception as e:
    print(f"Error: {e}")
    # Fallback imports if ImageChops is missing in first try block context
    try:
        from PIL import ImageChops
        # Retry logic or just print error
        print("Please re-run with ImageChops imported")
    except:
        pass
