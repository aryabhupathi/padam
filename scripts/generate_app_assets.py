"""
Asset generator for Padavinodam (పదవినోదం).
Generates all Android mipmap launcher icons, adaptive icons, splash screens,
Play Store 512x512 icon, and web favicons from high-res Tenali Rama artwork.
"""

import os
from PIL import Image, ImageOps, ImageDraw, ImageFilter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'padavinodam-frontend')
RES_DIR = os.path.join(FRONTEND_DIR, 'android', 'app', 'src', 'main', 'res')
PUBLIC_DIR = os.path.join(FRONTEND_DIR, 'public')

SRC_MASCOT = r'C:\Users\bhupa\.gemini\antigravity\brain\85636e62-b148-45b8-80e2-559a21e092a0\tenali_rama_mascot_1792331763186.jpg'
SRC_GAMEPLAY = r'C:\Users\bhupa\.gemini\antigravity\brain\85636e62-b148-45b8-80e2-559a21e092a0\padavinodam_gameplay_ui_1792331961725.jpg'

def generate_base_icon(src_path, size=1024):
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    crop_size = min(w, 850)
    left = (w - crop_size) // 2
    top = 40
    crop_box = (left, top, left + crop_size, top + crop_size)
    cropped = img.crop(crop_box)
    resized = cropped.resize((size, size), Image.Resampling.LANCZOS)
    return resized

def generate_rounded_icon(base_icon, size, radius_pct=0.2):
    im = base_icon.resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    radius = int(size * radius_pct)
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    
    # Gold border
    border = Image.new('RGBA', (size, size), (218, 165, 32, 255))
    output = Image.composite(im, border, mask)
    return output

def generate_circular_icon(base_icon, size):
    im = base_icon.resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([0, 0, size, size], fill=255)
    
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(im, (0, 0), mask)
    
    # Add gold rim ring
    ring_draw = ImageDraw.Draw(output)
    ring_width = max(2, int(size * 0.03))
    ring_draw.ellipse([ring_width//2, ring_width//2, size - ring_width//2, size - ring_width//2], outline=(245, 197, 24, 255), width=ring_width)
    return output

def generate_adaptive_foreground(base_icon, size):
    # Android adaptive icon foreground: icon occupies inner 66% safe zone
    fg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    inner_size = int(size * 0.72)
    offset = (size - inner_size) // 2
    inner_icon = base_icon.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
    
    # Circular safe crop for foreground mascot
    mask = Image.new('L', (inner_size, inner_size), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([0, 0, inner_size, inner_size], fill=255)
    
    fg.paste(inner_icon, (offset, offset), mask)
    return fg

def generate_splash(width, height, mascot_base):
    # Create royal deep temple gradient (indigo / dark purple / gold ambiance)
    splash = Image.new('RGBA', (width, height), (26, 11, 46, 255))
    draw = ImageDraw.Draw(splash)
    
    # Vignette gradient
    for y in range(height):
        ratio = y / height
        # Gradient from deep royal purple to warm dark amber
        r = int(26 + ratio * 30)
        g = int(11 + ratio * 15)
        b = int(46 - ratio * 15)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    
    # Mascot center badge
    badge_size = min(int(min(width, height) * 0.55), 450)
    if badge_size > 50:
        badge = generate_circular_icon(mascot_base, badge_size)
        bx = (width - badge_size) // 2
        by = (height - badge_size) // 2 - int(height * 0.05)
        splash.paste(badge, (bx, by), badge)
        
    return splash

def main():
    print("Generating Padavinodam App and Web Assets...")
    base_1024 = generate_base_icon(SRC_MASCOT, 1024)
    
    # 1. Play Store High-Res Icon (512x512)
    playstore_icon = generate_rounded_icon(base_1024, 512, radius_pct=0.22)
    playstore_path = os.path.join(FRONTEND_DIR, 'android', 'playstore-icon-512x512.png')
    playstore_icon.save(playstore_path, 'PNG')
    print(f"Created Play Store Icon: {playstore_path}")
    
    # 2. Web Icons
    web_512 = generate_rounded_icon(base_1024, 512, radius_pct=0.2)
    web_192 = generate_rounded_icon(base_1024, 192, radius_pct=0.2)
    web_fav = generate_circular_icon(base_1024, 64)
    
    web_512.save(os.path.join(PUBLIC_DIR, 'icon-512.png'), 'PNG')
    web_192.save(os.path.join(PUBLIC_DIR, 'icon-192.png'), 'PNG')
    web_fav.save(os.path.join(PUBLIC_DIR, 'favicon.png'), 'PNG')
    web_192.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon.png'), 'PNG')
    print("Created Web Icons in padavinodam-frontend/public")
    
    # 3. Android Mipmap Icons
    mipmap_configs = [
        ('mipmap-mdpi', 48, 108),
        ('mipmap-hdpi', 72, 162),
        ('mipmap-xhdpi', 96, 216),
        ('mipmap-xxhdpi', 144, 324),
        ('mipmap-xxxhdpi', 192, 432),
    ]
    
    for folder, launcher_sz, fg_sz in mipmap_configs:
        fpath = os.path.join(RES_DIR, folder)
        os.makedirs(fpath, exist_ok=True)
        
        # ic_launcher.png
        icon = generate_rounded_icon(base_1024, launcher_sz, radius_pct=0.18)
        icon.save(os.path.join(fpath, 'ic_launcher.png'), 'PNG')
        
        # ic_launcher_round.png
        round_icon = generate_circular_icon(base_1024, launcher_sz)
        round_icon.save(os.path.join(fpath, 'ic_launcher_round.png'), 'PNG')
        
        # ic_launcher_foreground.png
        fg_icon = generate_adaptive_foreground(base_1024, fg_sz)
        fg_icon.save(os.path.join(fpath, 'ic_launcher_foreground.png'), 'PNG')
        print(f"Generated icons for {folder}")
        
    # 4. Splash screens
    splash_configs = [
        ('drawable', (480, 320)),
        ('drawable-land-mdpi', (480, 320)),
        ('drawable-land-hdpi', (800, 480)),
        ('drawable-land-xhdpi', (1280, 720)),
        ('drawable-land-xxhdpi', (1600, 960)),
        ('drawable-land-xxxhdpi', (1920, 1280)),
        ('drawable-port-mdpi', (320, 480)),
        ('drawable-port-hdpi', (480, 800)),
        ('drawable-port-xhdpi', (720, 1280)),
        ('drawable-port-xxhdpi', (960, 1600)),
        ('drawable-port-xxxhdpi', (1280, 1920)),
    ]
    
    for folder, (w, h) in splash_configs:
        dpath = os.path.join(RES_DIR, folder)
        os.makedirs(dpath, exist_ok=True)
        splash_img = generate_splash(w, h, base_1024)
        splash_img.save(os.path.join(dpath, 'splash.png'), 'PNG')
        print(f"Generated splash for {folder} ({w}x{h})")

    print("\nAll brand assets generated with 100% precision!")

if __name__ == '__main__':
    main()
