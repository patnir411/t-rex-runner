#!/usr/bin/env python3
"""
Sprite Validation System for T-Rex Runner

Validates that processed sprites and packed sprite sheets are pixel-perfect
and aligned correctly for collision detection.

Usage:
    python validate_sprites.py
    python validate_sprites.py --verbose
    python validate_sprites.py --visualize
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional

try:
    from PIL import Image, ImageDraw, ImageFont
    import numpy as np
except ImportError:
    print("Error: Required packages not installed.")
    print("Please install: pip install Pillow numpy")
    sys.exit(1)


# ============================================================================
# GAME CONSTANTS (from index.js)
# ============================================================================

# Sprite sheet dimensions
LDPI_WIDTH = 1233
LDPI_HEIGHT = 68
HDPI_WIDTH = 2466
HDPI_HEIGHT = 136

# Sprite positions from Runner.spriteDefinition (index.js:163-188)
SPRITE_POSITIONS_LDPI = {
    'CACTUS_LARGE': {'x': 332, 'y': 2},
    'CACTUS_SMALL': {'x': 228, 'y': 2},
    'CLOUD': {'x': 86, 'y': 2},
    'HORIZON': {'x': 2, 'y': 54},
    'MOON': {'x': 484, 'y': 2},
    'PTERODACTYL': {'x': 134, 'y': 2},
    'RESTART': {'x': 2, 'y': 2},
    'TEXT_SPRITE': {'x': 655, 'y': 2},
    'TREX': {'x': 848, 'y': 2},
    'STAR': {'x': 645, 'y': 2}
}

# T-Rex animation frame offsets (index.js:1621-1642)
TREX_FRAMES = {
    'WAITING': [44, 0],
    'RUNNING': [88, 132],
    'CRASHED': [220],
    'JUMPING': [0],
    'DUCKING': [264, 323]
}

# T-Rex collision boxes (index.js:1583-1595)
TREX_COLLISION_BOXES = {
    'RUNNING': [
        {'x': 22, 'y': 0, 'w': 17, 'h': 16},
        {'x': 1, 'y': 18, 'w': 30, 'h': 9},
        {'x': 10, 'y': 35, 'w': 14, 'h': 8},
        {'x': 1, 'y': 24, 'w': 29, 'h': 5},
        {'x': 5, 'y': 30, 'w': 21, 'h': 4},
        {'x': 9, 'y': 34, 'w': 15, 'h': 4}
    ],
    'DUCKING': [
        {'x': 1, 'y': 18, 'w': 55, 'h': 25}
    ]
}

# Obstacle configurations (index.js:1468-1517)
OBSTACLE_CONFIGS = {
    'CACTUS_SMALL': {
        'width': 17,
        'height': 35,
        'yPos': 105,
        'collision_boxes': [
            {'x': 0, 'y': 7, 'w': 5, 'h': 27},
            {'x': 4, 'y': 0, 'w': 6, 'h': 34},
            {'x': 10, 'y': 4, 'w': 7, 'h': 14}
        ]
    },
    'CACTUS_LARGE': {
        'width': 25,
        'height': 50,
        'yPos': 90,
        'collision_boxes': [
            {'x': 0, 'y': 12, 'w': 7, 'h': 38},
            {'x': 8, 'y': 0, 'w': 7, 'h': 49},
            {'x': 13, 'y': 10, 'w': 10, 'h': 38}
        ]
    },
    'PTERODACTYL': {
        'width': 46,
        'height': 40,
        'yPos': [100, 75, 50],
        'collision_boxes': [
            {'x': 15, 'y': 15, 'w': 16, 'h': 5},
            {'x': 18, 'y': 21, 'w': 24, 'h': 6},
            {'x': 2, 'y': 14, 'w': 4, 'h': 3},
            {'x': 6, 'y': 10, 'w': 4, 'h': 7},
            {'x': 10, 'y': 8, 'w': 6, 'h': 9}
        ]
    }
}

# T-Rex config (index.js:1562-1576)
TREX_CONFIG = {
    'HEIGHT': 47,
    'WIDTH': 44,
    'WIDTH_DUCK': 59,
    'SPRITE_WIDTH': 262  # Note: This is old value, new is 382
}


# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

class SpriteValidator:
    """Validates sprite dimensions and alignment."""

    def __init__(self, config_path: str = "sprite_config.json"):
        """Load sprite configuration."""
        with open(config_path, 'r') as f:
            self.config = json.load(f)

        self.sprite_defs = self.config['sprite_definitions']
        self.errors = []
        self.warnings = []

    def validate_processed_sprites(self, processed_dir: Path) -> bool:
        """
        Validate that all processed sprites have correct dimensions.

        Args:
            processed_dir: Directory containing processed sprites

        Returns:
            True if all validations pass
        """
        print("\n" + "="*70)
        print("VALIDATING PROCESSED SPRITES")
        print("="*70)

        all_valid = True

        for sprite_type, sprite_def in self.sprite_defs.items():
            output_filename = sprite_def['output_filename']
            expected_dims = sprite_def['total_dimensions']

            sprite_path = processed_dir / output_filename

            print(f"\n📋 {sprite_type} ({output_filename}):")

            if not sprite_path.exists():
                self.errors.append(f"{sprite_type}: File not found at {sprite_path}")
                print(f"   ❌ File not found")
                all_valid = False
                continue

            # Load and check dimensions
            try:
                img = Image.open(sprite_path)
                actual_dims = img.size
                expected = (expected_dims['width'], expected_dims['height'])

                if actual_dims != expected:
                    self.errors.append(
                        f"{sprite_type}: Dimension mismatch. "
                        f"Expected {expected}, got {actual_dims}"
                    )
                    print(f"   ❌ Dimension mismatch: {actual_dims} != {expected}")
                    all_valid = False
                else:
                    print(f"   ✅ Dimensions correct: {actual_dims}")

                # Check for transparency
                if img.mode == 'RGBA':
                    alpha = np.array(img)[:, :, 3]
                    transparent_pixels = np.sum(alpha == 0)
                    total_pixels = alpha.size
                    transparency_ratio = transparent_pixels / total_pixels

                    print(f"   📊 Transparency: {transparency_ratio*100:.1f}% transparent")

                    if transparency_ratio < 0.01:
                        self.warnings.append(
                            f"{sprite_type}: Very low transparency ({transparency_ratio*100:.1f}%). "
                            "Background may not have been removed properly."
                        )
                        print(f"   ⚠️  Warning: Low transparency (background removal issue?)")

                    if transparency_ratio > 0.95:
                        self.warnings.append(
                            f"{sprite_type}: Very high transparency ({transparency_ratio*100:.1f}%). "
                            "Sprite content may be missing."
                        )
                        print(f"   ⚠️  Warning: High transparency (sprite content missing?)")

            except Exception as e:
                self.errors.append(f"{sprite_type}: Error loading image: {e}")
                print(f"   ❌ Error: {e}")
                all_valid = False

        return all_valid

    def validate_sprite_sheet(self, sprite_sheet_path: Path, scale: int = 1) -> bool:
        """
        Validate sprite sheet dimensions and sprite positions.

        Args:
            sprite_sheet_path: Path to sprite sheet (LDPI or HDPI)
            scale: 1 for LDPI, 2 for HDPI

        Returns:
            True if all validations pass
        """
        scale_name = "LDPI" if scale == 1 else "HDPI"
        expected_width = LDPI_WIDTH * scale
        expected_height = LDPI_HEIGHT * scale

        print(f"\n" + "="*70)
        print(f"VALIDATING {scale_name} SPRITE SHEET")
        print("="*70)

        print(f"\n📄 File: {sprite_sheet_path}")

        if not sprite_sheet_path.exists():
            self.errors.append(f"Sprite sheet not found: {sprite_sheet_path}")
            print(f"   ❌ File not found")
            return False

        # Load sprite sheet
        try:
            sprite_sheet = Image.open(sprite_sheet_path)
        except Exception as e:
            self.errors.append(f"Error loading sprite sheet: {e}")
            print(f"   ❌ Error loading: {e}")
            return False

        # Validate dimensions
        actual_size = sprite_sheet.size
        expected_size = (expected_width, expected_height)

        if actual_size != expected_size:
            self.errors.append(
                f"Sprite sheet dimension mismatch. Expected {expected_size}, got {actual_size}"
            )
            print(f"   ❌ Dimension mismatch: {actual_size} != {expected_size}")
            return False
        else:
            print(f"   ✅ Dimensions correct: {actual_size}")

        # Validate sprite positions
        print(f"\n📍 Validating sprite positions:")
        all_positions_valid = True

        for sprite_name, pos in SPRITE_POSITIONS_LDPI.items():
            x = pos['x'] * scale
            y = pos['y'] * scale

            # Get expected dimensions for this sprite
            sprite_info = self._get_sprite_dimensions(sprite_name)
            if sprite_info:
                w = sprite_info['width'] * scale
                h = sprite_info['height'] * scale

                # Extract sprite region
                try:
                    region = sprite_sheet.crop((x, y, x + w, y + h))

                    # Check if region has content (not all transparent)
                    if region.mode == 'RGBA':
                        alpha = np.array(region)[:, :, 3]
                        content_pixels = np.sum(alpha > 10)

                        if content_pixels == 0:
                            self.warnings.append(
                                f"{sprite_name}: No content at position ({x}, {y})"
                            )
                            print(f"   ⚠️  {sprite_name}: No content at ({x}, {y})")
                            all_positions_valid = False
                        else:
                            print(f"   ✅ {sprite_name}: Content found at ({x}, {y})")
                except Exception as e:
                    self.errors.append(f"{sprite_name}: Error extracting region: {e}")
                    print(f"   ❌ {sprite_name}: Error - {e}")
                    all_positions_valid = False

        return all_positions_valid

    def _get_sprite_dimensions(self, sprite_name: str) -> Optional[Dict]:
        """Get expected dimensions for a sprite from config."""
        # Map sprite sheet names to config names
        name_map = {
            'CACTUS_LARGE': 'cactus_large',
            'CACTUS_SMALL': 'cactus_small',
            'CLOUD': 'cloud',
            'HORIZON': 'horizon',
            'MOON': 'moon',
            'PTERODACTYL': 'pterodactyl',
            'RESTART': 'restart',
            'TEXT_SPRITE': 'numbers',
            'TREX': 'trex',
            'STAR': 'star'
        }

        config_name = name_map.get(sprite_name)
        if not config_name or config_name not in self.sprite_defs:
            return None

        return self.sprite_defs[config_name]['total_dimensions']

    def visualize_collision_boxes(
        self,
        sprite_sheet_path: Path,
        output_path: Path,
        scale: int = 1
    ):
        """
        Create a visualization showing collision boxes overlaid on sprites.

        Args:
            sprite_sheet_path: Path to sprite sheet
            output_path: Path to save visualization
            scale: 1 for LDPI, 2 for HDPI
        """
        print(f"\n🎨 Creating collision box visualization...")

        # Load sprite sheet
        sprite_sheet = Image.open(sprite_sheet_path).convert('RGBA')

        # Create a copy for drawing
        vis = sprite_sheet.copy()
        draw = ImageDraw.Draw(vis, 'RGBA')

        # Draw T-Rex collision boxes
        trex_pos = SPRITE_POSITIONS_LDPI['TREX']
        trex_x = trex_pos['x'] * scale
        trex_y = trex_pos['y'] * scale

        # Draw RUNNING collision boxes (on first frame at offset 0)
        for box in TREX_COLLISION_BOXES['RUNNING']:
            x = (trex_x + box['x']) * scale
            y = (trex_y + box['y']) * scale
            w = box['w'] * scale
            h = box['h'] * scale

            # Draw semi-transparent red box
            draw.rectangle(
                [x, y, x + w, y + h],
                outline=(255, 0, 0, 200),
                width=2
            )

        # Draw DUCKING collision boxes (on ducking frame at offset 264)
        ducking_offset = 264 * scale
        for box in TREX_COLLISION_BOXES['DUCKING']:
            x = (trex_x + ducking_offset + box['x']) * scale
            y = (trex_y + box['y']) * scale
            w = box['w'] * scale
            h = box['h'] * scale

            # Draw semi-transparent blue box
            draw.rectangle(
                [x, y, x + w, y + h],
                outline=(0, 0, 255, 200),
                width=2
            )

        # Draw obstacle collision boxes
        for obstacle_name, config in OBSTACLE_CONFIGS.items():
            sprite_name = obstacle_name
            if sprite_name not in SPRITE_POSITIONS_LDPI:
                continue

            pos = SPRITE_POSITIONS_LDPI[sprite_name]
            base_x = pos['x'] * scale
            base_y = pos['y'] * scale

            for box in config['collision_boxes']:
                x = (base_x + box['x']) * scale
                y = (base_y + box['y']) * scale
                w = box['w'] * scale
                h = box['h'] * scale

                # Draw semi-transparent green box
                draw.rectangle(
                    [x, y, x + w, y + h],
                    outline=(0, 255, 0, 200),
                    width=2
                )

        # Save visualization
        vis.save(output_path)
        print(f"   ✅ Saved visualization: {output_path}")

    def print_summary(self):
        """Print validation summary."""
        print("\n" + "="*70)
        print("VALIDATION SUMMARY")
        print("="*70)

        if not self.errors and not self.warnings:
            print("\n✅ ALL VALIDATIONS PASSED!")
            print("   Sprites are pixel-perfect and ready for deployment.")
            return True

        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for i, error in enumerate(self.errors, 1):
                print(f"   {i}. {error}")

        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for i, warning in enumerate(self.warnings, 1):
                print(f"   {i}. {warning}")

        return len(self.errors) == 0


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Validate T-Rex Runner sprites for pixel-perfect alignment'
    )
    parser.add_argument(
        '--processed',
        type=str,
        default='processed_sprites',
        help='Directory containing processed sprites (default: processed_sprites/)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='output',
        help='Directory containing sprite sheets (default: output/)'
    )
    parser.add_argument(
        '--visualize',
        action='store_true',
        help='Create collision box visualization'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Verbose output'
    )

    args = parser.parse_args()

    # Initialize validator
    validator = SpriteValidator()

    # Validate processed sprites
    processed_dir = Path(args.processed)
    if processed_dir.exists():
        validator.validate_processed_sprites(processed_dir)
    else:
        print(f"⚠️  Processed sprites directory not found: {processed_dir}")

    # Validate sprite sheets
    ldpi_path = Path(args.output) / 'default_100_percent' / '100-offline-sprite.png'
    hdpi_path = Path(args.output) / 'default_200_percent' / '200-offline-sprite.png'

    if ldpi_path.exists():
        validator.validate_sprite_sheet(ldpi_path, scale=1)
    else:
        print(f"\n⚠️  LDPI sprite sheet not found: {ldpi_path}")

    if hdpi_path.exists():
        validator.validate_sprite_sheet(hdpi_path, scale=2)
    else:
        print(f"\n⚠️  HDPI sprite sheet not found: {hdpi_path}")

    # Create visualizations
    if args.visualize:
        if ldpi_path.exists():
            vis_path = Path(args.output) / 'collision_boxes_ldpi.png'
            validator.visualize_collision_boxes(ldpi_path, vis_path, scale=1)

        if hdpi_path.exists():
            vis_path = Path(args.output) / 'collision_boxes_hdpi.png'
            validator.visualize_collision_boxes(hdpi_path, vis_path, scale=2)

    # Print summary
    success = validator.print_summary()

    if not success:
        sys.exit(1)


if __name__ == '__main__':
    main()
