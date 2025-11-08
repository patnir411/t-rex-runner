#!/usr/bin/env python3
"""
Theme Validation Script
Checks if all required sprites exist and have correct dimensions
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: PIL/Pillow not installed")
    print("Install with: pip install Pillow")
    sys.exit(1)

# Expected dimensions for processed sprites
EXPECTED_PROCESSED = {
    'restart.png': (36, 32),
    'cloud.png': (46, 14),
    'pterodactyl.png': (92, 40),
    'cactus_small.png': (51, 35),
    'cactus_large.png': (75, 50),
    'moon.png': (160, 40),
    'star.png': (9, 9),
    'numbers.png': (191, 13),
    'trex.png': (382, 47),
    'horizon.png': (1200, 12),
}

# Expected AI-generated sprite files (for minimal T-Rex test)
MINIMAL_AI_SPRITES = [
    'trex_standing.png',
    'trex_blinking.png',
    'trex_running_1.png',
    'trex_running_2.png',
    'trex_crashed.png',
    'trex_ducking_1.png',
    'trex_ducking_2.png',
]

# All required AI sprites (for full theme)
FULL_AI_SPRITES = MINIMAL_AI_SPRITES + [
    'pterodactyl_1.png', 'pterodactyl_2.png',
    'cactus_small_1.png', 'cactus_small_2.png', 'cactus_small_3.png',
    'cactus_large_1.png', 'cactus_large_2.png', 'cactus_large_3.png',
    'moon_phase_1.png', 'moon_phase_2.png', 'moon_phase_3.png',
    'moon_phase_4.png', 'moon_phase_5.png', 'moon_phase_6.png', 'moon_phase_7.png',
    'cloud.png', 'star.png', 'horizon.png',
    'restart.png', 'numbers.png',
]

def check_ai_generated(base_dir, full_theme=False):
    """Check if AI-generated sprites exist."""
    ai_dir = Path(base_dir) / 'ai_generated'
    expected = FULL_AI_SPRITES if full_theme else MINIMAL_AI_SPRITES

    print(f"\n{'='*60}")
    print(f"Checking AI-Generated Sprites ({len(expected)} expected)")
    print(f"{'='*60}")
    print(f"Directory: {ai_dir}")

    if not ai_dir.exists():
        print(f"❌ Directory does not exist: {ai_dir}")
        return False

    found = []
    missing = []

    for filename in expected:
        filepath = ai_dir / filename
        if filepath.exists():
            found.append(filename)
            # Get dimensions
            try:
                img = Image.open(filepath)
                print(f"✓ {filename:30} {img.size[0]:4}×{img.size[1]:<4}")
            except Exception as e:
                print(f"⚠ {filename:30} (error reading: {e})")
        else:
            missing.append(filename)
            print(f"✗ {filename:30} MISSING")

    print(f"\nFound: {len(found)}/{len(expected)}")

    if missing:
        print(f"Missing: {', '.join(missing)}")
        return False

    return True

def check_processed(base_dir, sprites_to_check=None):
    """Check if processed sprites exist and have correct dimensions."""
    proc_dir = Path(base_dir) / 'processed_sprites'

    if sprites_to_check is None:
        sprites_to_check = EXPECTED_PROCESSED.keys()

    print(f"\n{'='*60}")
    print(f"Checking Processed Sprites ({len(sprites_to_check)} expected)")
    print(f"{'='*60}")
    print(f"Directory: {proc_dir}")

    if not proc_dir.exists():
        print(f"❌ Directory does not exist: {proc_dir}")
        return False

    all_ok = True

    for filename in sprites_to_check:
        expected_dims = EXPECTED_PROCESSED[filename]
        filepath = proc_dir / filename

        if not filepath.exists():
            print(f"✗ {filename:30} MISSING")
            all_ok = False
            continue

        try:
            img = Image.open(filepath)
            actual_dims = img.size

            if actual_dims == expected_dims:
                print(f"✓ {filename:30} {actual_dims[0]:4}×{actual_dims[1]:<4} (correct)")
            else:
                print(f"✗ {filename:30} {actual_dims[0]:4}×{actual_dims[1]:<4} "
                      f"(expected {expected_dims[0]:4}×{expected_dims[1]:<4})")
                all_ok = False
        except Exception as e:
            print(f"✗ {filename:30} ERROR: {e}")
            all_ok = False

    # Check for preview
    preview_path = proc_dir / 'preview.png'
    if preview_path.exists():
        print(f"\n✓ Preview image found: {preview_path}")

    return all_ok

def check_output(base_dir):
    """Check if final sprite sheets exist and have correct dimensions."""
    output_dir = Path(base_dir) / 'output'

    print(f"\n{'='*60}")
    print(f"Checking Output Sprite Sheets")
    print(f"{'='*60}")
    print(f"Directory: {output_dir}")

    if not output_dir.exists():
        print(f"❌ Directory does not exist: {output_dir}")
        return False

    all_ok = True

    # Check LDPI
    ldpi_path = output_dir / 'default_100_percent' / '100-offline-sprite.png'
    if ldpi_path.exists():
        img = Image.open(ldpi_path)
        if img.size == (1233, 68):
            print(f"✓ LDPI sprite sheet: {img.size[0]}×{img.size[1]} (correct)")
        else:
            print(f"✗ LDPI sprite sheet: {img.size[0]}×{img.size[1]} (expected 1233×68)")
            all_ok = False
    else:
        print(f"✗ LDPI sprite sheet MISSING: {ldpi_path}")
        all_ok = False

    # Check HDPI
    hdpi_path = output_dir / 'default_200_percent' / '200-offline-sprite.png'
    if hdpi_path.exists():
        img = Image.open(hdpi_path)
        if img.size == (2466, 136):
            print(f"✓ HDPI sprite sheet: {img.size[0]}×{img.size[1]} (correct)")
        else:
            print(f"✗ HDPI sprite sheet: {img.size[0]}×{img.size[1]} (expected 2466×136)")
            all_ok = False
    else:
        print(f"✗ HDPI sprite sheet MISSING: {hdpi_path}")
        all_ok = False

    return all_ok

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Validate theme sprites')
    parser.add_argument('--dir', default='.', help='Theme directory (default: current)')
    parser.add_argument('--stage', choices=['ai', 'processed', 'output', 'all'],
                       default='all', help='Which stage to check')
    parser.add_argument('--full', action='store_true',
                       help='Check for full theme (27 sprites) instead of minimal (7)')

    args = parser.parse_args()

    base_dir = Path(args.dir)

    print(f"\n🔍 Theme Validation")
    print(f"Theme directory: {base_dir.resolve()}")
    print(f"Mode: {'Full theme (27 sprites)' if args.full else 'Minimal (T-Rex only, 7 sprites)'}")

    results = {}

    if args.stage in ['ai', 'all']:
        results['ai'] = check_ai_generated(base_dir, args.full)

    if args.stage in ['processed', 'all']:
        sprites_to_check = EXPECTED_PROCESSED.keys() if args.full else ['trex.png']
        results['processed'] = check_processed(base_dir, sprites_to_check)

    if args.stage in ['output', 'all']:
        results['output'] = check_output(base_dir)

    # Summary
    print(f"\n{'='*60}")
    print("VALIDATION SUMMARY")
    print(f"{'='*60}")

    for stage, success in results.items():
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{stage.upper():15} {status}")

    if all(results.values()):
        print("\n✅ All checks passed!")
        return 0
    else:
        print("\n❌ Some checks failed. See details above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
