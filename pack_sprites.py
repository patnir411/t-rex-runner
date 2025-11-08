#!/usr/bin/env python3
"""
Sprite Packer for T-Rex Runner
Packs individual sprites into a sprite sheet using the original game's coordinates
"""

from PIL import Image
import os

# Sprite positions and sizes for LDPI (100%) version
SPRITE_MAP = {
    'restart.png': {'x': 2, 'y': 2, 'w': 36, 'h': 32},
    'cloud.png': {'x': 86, 'y': 2, 'w': 46, 'h': 14},
    'pterodactyl.png': {'x': 134, 'y': 2, 'w': 92, 'h': 40},  # 2 frames side by side
    'cactus_small.png': {'x': 228, 'y': 2, 'w': 51, 'h': 35},  # 3 variations
    'cactus_large.png': {'x': 332, 'y': 2, 'w': 75, 'h': 50},  # 3 variations
    'moon.png': {'x': 484, 'y': 2, 'w': 160, 'h': 40},  # 7 phases
    'star.png': {'x': 645, 'y': 2, 'w': 9, 'h': 9},
    'numbers.png': {'x': 655, 'y': 2, 'w': 191, 'h': 13},  # 0-9, H, I, GAME OVER
    'trex.png': {'x': 848, 'y': 2, 'w': 382, 'h': 47},  # All T-Rex frames with offsets
    'horizon.png': {'x': 2, 'y': 54, 'w': 1200, 'h': 12}
}

# Canvas size (T-Rex at x=848, width=382, ends at x=1230)
CANVAS_WIDTH = 1233
CANVAS_HEIGHT = 68

def pack_sprites(input_dir='my_sprites', output_dir='assets'):
    """
    Pack individual sprites into a sprite sheet

    Args:
        input_dir: Directory containing your individual sprites
        output_dir: Directory to save the sprite sheets
    """

    print(f"🎨 T-Rex Runner Sprite Packer")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # Create blank sprite sheet (RGBA for transparency)
    sprite_sheet = Image.new('RGBA', (CANVAS_WIDTH, CANVAS_HEIGHT), (0, 0, 0, 0))

    # Track which sprites were found
    found = []
    missing = []

    # Pack each sprite
    for filename, pos in SPRITE_MAP.items():
        filepath = os.path.join(input_dir, filename)

        if os.path.exists(filepath):
            try:
                # Load the sprite
                sprite = Image.open(filepath).convert('RGBA')

                # Verify size matches expected dimensions
                expected_size = (pos['w'], pos['h'])
                if sprite.size != expected_size:
                    print(f"⚠️  {filename}: Size {sprite.size} (expected {expected_size})")
                    # Resize if needed
                    sprite = sprite.resize(expected_size, Image.LANCZOS)

                # Paste at the specified position
                sprite_sheet.paste(sprite, (pos['x'], pos['y']), sprite)
                found.append(filename)
                print(f"✓  {filename} → ({pos['x']}, {pos['y']})")

            except Exception as e:
                print(f"✗  {filename}: Error - {e}")
                missing.append(filename)
        else:
            missing.append(filename)

    # Summary
    print(f"\n📊 Summary:")
    print(f"   Found: {len(found)}/{len(SPRITE_MAP)}")
    if missing:
        print(f"   Missing: {', '.join(missing)}")

    # Save LDPI version (100%)
    ldpi_dir = os.path.join(output_dir, 'default_100_percent')
    os.makedirs(ldpi_dir, exist_ok=True)
    ldpi_path = os.path.join(ldpi_dir, '100-offline-sprite.png')
    sprite_sheet.save(ldpi_path)
    print(f"\n💾 Saved LDPI: {ldpi_path}")

    # Create and save HDPI version (200% - double size)
    hdpi_size = (CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2)
    hdpi_sheet = sprite_sheet.resize(hdpi_size, Image.NEAREST)  # Use NEAREST for pixel art

    hdpi_dir = os.path.join(output_dir, 'default_200_percent')
    os.makedirs(hdpi_dir, exist_ok=True)
    hdpi_path = os.path.join(hdpi_dir, '200-offline-sprite.png')
    hdpi_sheet.save(hdpi_path)
    print(f"💾 Saved HDPI: {hdpi_path}")

    print(f"\n✅ Done! Replace the original sprite sheets with these files.")
    print(f"   Open index.html to test your custom theme!")

if __name__ == '__main__':
    import sys
    import argparse

    parser = argparse.ArgumentParser(
        description='Pack individual sprites into T-Rex Runner sprite sheet'
    )
    parser.add_argument(
        '--input',
        type=str,
        default='my_sprites',
        help='Input directory containing individual sprites (default: my_sprites/)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='assets',
        help='Output directory for sprite sheets (default: assets/)'
    )

    args = parser.parse_args()

    # Check if input directory exists
    if not os.path.exists(args.input):
        print(f"❌ Directory '{args.input}' not found!")
        print(f"\nUsage:")
        print(f"  python pack_sprites.py --input my_sprites --output assets")
        print(f"\nCreate a '{args.input}' folder and add your sprites:")
        for filename in SPRITE_MAP.keys():
            print(f"  - {filename}")
        sys.exit(1)

    pack_sprites(args.input, args.output)
