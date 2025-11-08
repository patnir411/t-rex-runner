#!/usr/bin/env python3
"""
AI Sprite Processor for T-Rex Runner
Processes raw AI-generated images into game-ready sprites with exact dimensions.

Usage:
    python process_ai_sprites.py --input ai_generated/ --output processed_sprites/
    python process_ai_sprites.py --input ai_generated/ --output processed_sprites/ --preview
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


class SpriteProcessor:
    """Processes AI-generated sprites for T-Rex game."""

    def __init__(self, config_path: str = "sprite_config.json"):
        """Load sprite configuration."""
        with open(config_path, 'r') as f:
            self.config = json.load(f)

        self.sprite_defs = self.config['sprite_definitions']
        self.proc_config = self.config['processing_config']

    def detect_background_color(self, image: Image.Image) -> Tuple[int, int, int]:
        """
        Detect background color by sampling edge pixels.

        Args:
            image: Input PIL Image

        Returns:
            Tuple of (R, G, B) representing detected background color
        """
        img_array = np.array(image.convert('RGB'))
        height, width = img_array.shape[:2]

        # Calculate sample size from edge percentage
        edge_percent = self.proc_config['background_detection']['edge_sample_percent']
        edge_h = max(1, int(height * edge_percent / 100))
        edge_w = max(1, int(width * edge_percent / 100))

        # Sample pixels from all four edges
        edge_pixels = []

        # Top and bottom edges
        edge_pixels.extend(img_array[:edge_h, :].reshape(-1, 3))
        edge_pixels.extend(img_array[-edge_h:, :].reshape(-1, 3))

        # Left and right edges (excluding corners already sampled)
        edge_pixels.extend(img_array[edge_h:-edge_h, :edge_w].reshape(-1, 3))
        edge_pixels.extend(img_array[edge_h:-edge_h, -edge_w:].reshape(-1, 3))

        edge_pixels = np.array(edge_pixels)

        # Use median to be robust against outliers
        bg_color = tuple(np.median(edge_pixels, axis=0).astype(int))

        return bg_color

    def auto_crop(self, image: Image.Image, padding: int = None) -> Image.Image:
        """
        Auto-crop image by removing background detected from edges.

        Args:
            image: Input PIL Image
            padding: Extra padding around cropped sprite (default from config)

        Returns:
            Cropped PIL Image
        """
        if padding is None:
            padding = self.proc_config['background_detection']['crop_padding']

        # Detect background color
        bg_color = self.detect_background_color(image)

        # Convert to numpy array
        img_array = np.array(image.convert('RGB'))

        # Create binary mask: True where pixel differs from background
        threshold = self.proc_config['background_detection']['color_threshold']
        diff = np.abs(img_array - np.array(bg_color))
        mask = np.any(diff > threshold, axis=2)

        # Find bounding box of non-background pixels
        rows = np.any(mask, axis=1)
        cols = np.any(mask, axis=0)

        if not np.any(rows) or not np.any(cols):
            print(f"  Warning: No sprite content detected, returning original image")
            return image

        y_min, y_max = np.where(rows)[0][[0, -1]]
        x_min, x_max = np.where(cols)[0][[0, -1]]

        # Add padding
        height, width = img_array.shape[:2]
        y_min = max(0, y_min - padding)
        y_max = min(height - 1, y_max + padding)
        x_min = max(0, x_min - padding)
        x_max = min(width - 1, x_max + padding)

        # Crop
        cropped = image.crop((x_min, y_min, x_max + 1, y_max + 1))

        print(f"  Auto-cropped: {image.size} → {cropped.size} (bg color: RGB{bg_color})")

        return cropped

    def intelligent_resize(self, image: Image.Image, target_width: int, target_height: int, bottom_align: bool = True) -> Image.Image:
        """
        Resize image to exact target dimensions with intelligent aspect ratio handling.

        If aspect ratios don't match, crops to target ratio with optional bottom-alignment.

        Args:
            image: Input PIL Image
            target_width: Target width in pixels
            target_height: Target height in pixels
            bottom_align: If True, align sprite to bottom (for ground-based characters)

        Returns:
            Resized PIL Image at exact target dimensions
        """
        src_width, src_height = image.size
        src_aspect = src_width / src_height
        target_aspect = target_width / target_height

        aspect_diff = abs(src_aspect - target_aspect) / target_aspect

        # If aspect ratios are very different, warn user
        warn_threshold = self.proc_config['validation']['warn_aspect_ratio_diff']
        if aspect_diff > warn_threshold:
            print(f"  Warning: Large aspect ratio difference ({aspect_diff:.1%}). "
                  f"Source {src_aspect:.2f}, target {target_aspect:.2f}")

        # Crop to target aspect ratio if needed
        if aspect_diff > 0.01:  # More than 1% difference
            if src_aspect > target_aspect:
                # Source is wider, crop width (center)
                new_width = int(src_height * target_aspect)
                left = (src_width - new_width) // 2
                image = image.crop((left, 0, left + new_width, src_height))
                print(f"  Aspect ratio fix: cropped width to {new_width}px (centered)")
            else:
                # Source is taller, crop height
                new_height = int(src_width / target_aspect)
                if bottom_align:
                    # Align to bottom (keep feet on ground)
                    top = src_height - new_height
                    image = image.crop((0, top, src_width, src_height))
                    print(f"  Aspect ratio fix: cropped height to {new_height}px (bottom-aligned)")
                else:
                    # Center-align
                    top = (src_height - new_height) // 2
                    image = image.crop((0, top, src_width, top + new_height))
                    print(f"  Aspect ratio fix: cropped height to {new_height}px (centered)")

        # Resize to exact target dimensions
        resample = getattr(Image.Resampling, self.proc_config['resize_quality'])
        resized = image.resize((target_width, target_height), resample)

        print(f"  Resized: {image.size} → {resized.size}")

        return resized

    def combine_frames(self, frames: List[Image.Image], frame_defs: List[Dict] = None, total_width: int = None, total_height: int = None) -> Image.Image:
        """
        Combine multiple frames into a single sprite sheet.

        Args:
            frames: List of PIL Images
            frame_defs: List of frame definitions with 'offset' and 'width' keys (optional)
            total_width: Total width of combined sprite (optional, auto-calculated if not provided)
            total_height: Total height of combined sprite (optional, auto-calculated if not provided)

        Returns:
            Combined PIL Image
        """
        if not frames:
            raise ValueError("No frames to combine")

        if len(frames) == 1:
            return frames[0]

        # Determine if we have frame offsets
        has_offsets = frame_defs and all('offset' in fd for fd in frame_defs)

        if has_offsets:
            # Place frames at specific offsets
            heights = [f.height for f in frames]
            if len(set(heights)) > 1:
                print(f"  Warning: Frames have different heights: {heights}")

            # Calculate canvas size
            if total_width is None:
                # Find the rightmost pixel
                last_offset = max(fd['offset'] + fd['width'] for fd in frame_defs)
                total_width = last_offset
            if total_height is None:
                total_height = max(heights)

            combined = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))

            for frame, frame_def in zip(frames, frame_defs):
                x_offset = frame_def['offset']
                combined.paste(frame, (x_offset, 0))

            print(f"  Combined {len(frames)} frames with offsets: {combined.size}")

        else:
            # Sequential horizontal stacking (legacy behavior)
            heights = [f.height for f in frames]
            if len(set(heights)) > 1:
                print(f"  Warning: Frames have different heights: {heights}")

            if total_width is None:
                total_width = sum(f.width for f in frames)
            if total_height is None:
                total_height = max(heights)

            combined = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))

            x_offset = 0
            for frame in frames:
                combined.paste(frame, (x_offset, 0))
                x_offset += frame.width

            print(f"  Combined {len(frames)} frames horizontally: {combined.size}")

        return combined

    def process_sprite_type(self, sprite_type: str, input_dir: Path, output_dir: Path) -> bool:
        """
        Process all frames for a sprite type.

        Args:
            sprite_type: Name of sprite type from config
            input_dir: Directory containing raw AI images
            output_dir: Directory to save processed sprite

        Returns:
            True if successful, False otherwise
        """
        sprite_def = self.sprite_defs[sprite_type]
        output_filename = sprite_def['output_filename']
        frames_def = sprite_def['frames']

        print(f"\nProcessing {sprite_type} ({len(frames_def)} frame(s)):")

        processed_frames = []

        for frame_def in frames_def:
            frame_name = frame_def['name']
            target_width = frame_def['width']
            target_height = frame_def['height']

            # Look for input file (try with and without extension)
            input_path = None
            for ext in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']:
                candidate = input_dir / f"{frame_name}{ext}"
                if candidate.exists():
                    input_path = candidate
                    break

            if not input_path:
                print(f"  Error: Input file not found for '{frame_name}'")
                print(f"    Expected: {input_dir}/{frame_name}.(png|jpg)")
                return False

            print(f"  Frame: {frame_name}")
            print(f"    Input: {input_path.name}")

            # Load image
            try:
                image = Image.open(input_path).convert('RGBA')
            except Exception as e:
                print(f"    Error loading image: {e}")
                return False

            # Auto-crop
            cropped = self.auto_crop(image)

            # Resize to exact dimensions
            resized = self.intelligent_resize(cropped, target_width, target_height)

            processed_frames.append(resized)

        # Combine frames if multi-frame sprite
        if len(processed_frames) > 1:
            expected_dims = sprite_def['total_dimensions']
            final_sprite = self.combine_frames(
                processed_frames,
                frame_defs=frames_def,
                total_width=expected_dims['width'],
                total_height=expected_dims['height']
            )
        else:
            final_sprite = processed_frames[0]

        # Validate final dimensions
        expected_dims = sprite_def['total_dimensions']
        if final_sprite.size != (expected_dims['width'], expected_dims['height']):
            print(f"  Error: Final sprite size {final_sprite.size} != expected "
                  f"({expected_dims['width']}, {expected_dims['height']})")
            return False

        # Save
        output_path = output_dir / output_filename
        final_sprite.save(output_path, 'PNG')
        print(f"  ✓ Saved: {output_path}")

        return True

    def process_all(self, input_dir: Path, output_dir: Path, sprite_types: List[str] = None) -> Dict[str, bool]:
        """
        Process all sprite types or specified subset.

        Args:
            input_dir: Directory containing raw AI images
            output_dir: Directory to save processed sprites
            sprite_types: List of sprite type names to process (None = all)

        Returns:
            Dict mapping sprite_type -> success boolean
        """
        # Create output directory
        output_dir.mkdir(parents=True, exist_ok=True)

        if sprite_types is None:
            sprite_types = list(self.sprite_defs.keys())

        results = {}

        print(f"Processing {len(sprite_types)} sprite type(s)...")
        print(f"Input directory: {input_dir}")
        print(f"Output directory: {output_dir}")

        for sprite_type in sprite_types:
            if sprite_type not in self.sprite_defs:
                print(f"\nError: Unknown sprite type '{sprite_type}'")
                results[sprite_type] = False
                continue

            success = self.process_sprite_type(sprite_type, input_dir, output_dir)
            results[sprite_type] = success

        # Summary
        print("\n" + "="*60)
        print("PROCESSING SUMMARY")
        print("="*60)

        success_count = sum(results.values())
        total_count = len(results)

        for sprite_type, success in results.items():
            status = "✓" if success else "✗"
            print(f"{status} {sprite_type}")

        print(f"\nCompleted: {success_count}/{total_count} sprite types")

        if success_count == total_count:
            print("\n✓ All sprites processed successfully!")
            print(f"\nNext step: Run pack_sprites.py to create final sprite sheet:")
            print(f"  python pack_sprites.py --input {output_dir} --output output/")
        else:
            print("\n✗ Some sprites failed. Check errors above.")

        return results

    def create_preview(self, output_dir: Path, preview_path: Path):
        """
        Create a preview image showing all processed sprites with labels.

        Args:
            output_dir: Directory containing processed sprites
            preview_path: Path to save preview image
        """
        print(f"\nCreating preview image...")

        # Load all sprites
        sprites = []
        for sprite_type, sprite_def in self.sprite_defs.items():
            sprite_path = output_dir / sprite_def['output_filename']
            if sprite_path.exists():
                img = Image.open(sprite_path)
                sprites.append((sprite_type, img))

        if not sprites:
            print("  No sprites found to preview")
            return

        # Calculate preview layout (vertical stack with labels)
        label_height = 20
        spacing = 10
        margin = 20

        max_width = max(img.width for _, img in sprites)
        preview_width = max_width + margin * 2
        preview_height = margin + sum(img.height + label_height + spacing for _, img in sprites)

        # Create preview canvas
        preview = Image.new('RGB', (preview_width, preview_height), (240, 240, 240))
        draw = ImageDraw.Draw(preview)

        # Draw sprites
        y_offset = margin
        for sprite_type, img in sprites:
            # Draw sprite name
            draw.text((margin, y_offset), sprite_type, fill=(0, 0, 0))
            y_offset += label_height

            # Draw sprite (centered)
            x_pos = margin + (max_width - img.width) // 2

            # Create white background for sprite
            sprite_bg = Image.new('RGB', img.size, (255, 255, 255))
            sprite_bg.paste(img, (0, 0), img if img.mode == 'RGBA' else None)

            preview.paste(sprite_bg, (x_pos, y_offset))

            # Draw border
            draw.rectangle(
                [x_pos, y_offset, x_pos + img.width - 1, y_offset + img.height - 1],
                outline=(200, 200, 200)
            )

            y_offset += img.height + spacing

        preview.save(preview_path, 'PNG')
        print(f"  ✓ Preview saved: {preview_path}")


def main():
    parser = argparse.ArgumentParser(
        description='Process AI-generated sprites for T-Rex Runner game'
    )
    parser.add_argument(
        '--input',
        type=str,
        default='ai_generated',
        help='Input directory containing raw AI images (default: ai_generated/)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='processed_sprites',
        help='Output directory for processed sprites (default: processed_sprites/)'
    )
    parser.add_argument(
        '--config',
        type=str,
        default='sprite_config.json',
        help='Sprite configuration file (default: sprite_config.json)'
    )
    parser.add_argument(
        '--sprites',
        type=str,
        nargs='+',
        help='Specific sprite types to process (default: all)'
    )
    parser.add_argument(
        '--preview',
        action='store_true',
        help='Create preview image of all processed sprites'
    )

    args = parser.parse_args()

    # Convert paths
    input_dir = Path(args.input)
    output_dir = Path(args.output)

    # Check input directory exists
    if not input_dir.exists():
        print(f"Error: Input directory not found: {input_dir}")
        print(f"\nCreate it and add your AI-generated images:")
        print(f"  mkdir {input_dir}")
        sys.exit(1)

    # Check config exists
    if not Path(args.config).exists():
        print(f"Error: Config file not found: {args.config}")
        sys.exit(1)

    # Process sprites
    processor = SpriteProcessor(args.config)
    results = processor.process_all(input_dir, output_dir, args.sprites)

    # Create preview if requested
    if args.preview and any(results.values()):
        preview_path = output_dir / 'preview.png'
        processor.create_preview(output_dir, preview_path)

    # Exit with error code if any sprites failed
    if not all(results.values()):
        sys.exit(1)


if __name__ == '__main__':
    main()
