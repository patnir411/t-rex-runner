# AI Sprite Replacement Pipeline for T-Rex Runner

Automated pipeline for replacing T-Rex game sprites with AI-generated images.

## Overview

This pipeline allows you to:
1. **Generate** sprites using AI image generators (Gemini, DALL-E, etc.)
2. **Process** raw AI images (auto-crop, resize, combine frames)
3. **Pack** processed sprites into game-ready sprite sheets
4. **Play** with your custom theme!

## Quick Start

### Prerequisites

```bash
pip install Pillow numpy
```

### Step 1: Generate AI Sprites

Use AI image generator (Gemini, DALL-E, Midjourney, etc.) to create sprites.

See **[AI_PROMPTS.md](AI_PROMPTS.md)** for detailed prompting guide and examples.

Save generated images to `ai_generated/` directory with these filenames:

**Required files (27 total):**
- `restart.png`
- `cloud.png`
- `star.png`
- `horizon.png`
- `numbers.png`
- `trex_standing.png`, `trex_blinking.png`, `trex_running_1.png`, `trex_running_2.png`, `trex_crashed.png`, `trex_ducking_1.png`, `trex_ducking_2.png`
- `pterodactyl_1.png`, `pterodactyl_2.png`
- `cactus_small_1.png`, `cactus_small_2.png`, `cactus_small_3.png`
- `cactus_large_1.png`, `cactus_large_2.png`, `cactus_large_3.png`
- `moon_phase_1.png` through `moon_phase_7.png`

**Important:** AI images can be any size (512×512, 1024×1024, etc.) with any solid background color. The pipeline handles all resizing and cropping automatically.

### Step 2: Process Raw AI Images

```bash
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/
```

This script automatically:
- ✓ Detects and removes background color
- ✓ Crops to sprite content bounds
- ✓ Resizes to exact game dimensions
- ✓ Combines multi-frame sprites into horizontal strips
- ✓ Validates dimensions

**Optional:** Create preview of processed sprites:
```bash
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/ --preview
```

### Step 3: Pack into Sprite Sheet

```bash
python pack_sprites.py --input processed_sprites/ --output output/
```

This creates:
- `output/default_100_percent/100-offline-sprite.png` (LDPI, 1233×68)
- `output/default_200_percent/200-offline-sprite.png` (HDPI, 2466×136)

### Step 4: Use in Game

```bash
# Backup original sprites (recommended)
cp -r assets/default_100_percent assets/default_100_percent.backup
cp -r assets/default_200_percent assets/default_200_percent.backup

# Copy new sprites
cp output/default_100_percent/100-offline-sprite.png assets/default_100_percent/
cp output/default_200_percent/200-offline-sprite.png assets/default_200_percent/

# Open game in browser
open index.html
```

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ 1. AI GENERATION (manual)                                   │
│    Gemini/DALL-E/etc → ai_generated/                        │
│    - Any size (512×512, 1024×1024, etc.)                   │
│    - Any background color (white, cream, etc.)              │
│    - Sprite centered in image                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PROCESSING (process_ai_sprites.py)                       │
│    Auto-crop → Resize → Combine frames                      │
│                                                              │
│    For each sprite:                                          │
│    a) Detect background by sampling edges                   │
│    b) Create binary mask (non-background pixels)            │
│    c) Find bounding box of sprite content                   │
│    d) Crop with padding                                     │
│    e) Resize to exact target dimensions (LANCZOS)           │
│    f) Combine frames into strips (for animations)           │
│                                                              │
│    Output → processed_sprites/                              │
│    - Exact dimensions per sprite_config.json                │
│    - Multi-frame sprites combined into strips               │
│    - RGBA with transparency                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PACKING (pack_sprites.py)                                │
│    Place sprites at fixed coordinates                        │
│                                                              │
│    - Creates 1233×68 LDPI sprite sheet                      │
│    - Creates 2466×136 HDPI sprite sheet (2x upscale)        │
│    - Uses NEAREST neighbor for pixel-perfect scaling        │
│                                                              │
│    Output → output/default_100_percent/ & default_200_percent/│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DEPLOYMENT (manual)                                       │
│    Copy to assets/ → Open index.html → Play!                │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
t-rex-runner/
├── ai_generated/              # Raw AI-generated images (any size)
│   ├── README.md             # Naming conventions and requirements
│   ├── trex_standing.png
│   ├── trex_running_1.png
│   └── ...
│
├── processed_sprites/         # Processed, exact-dimension sprites
│   ├── README.md             # What this directory contains
│   ├── restart.png           # 36×32
│   ├── trex.png              # 262×47 (6 frames combined)
│   └── ...
│
├── output/                    # Final sprite sheets
│   ├── README.md             # Usage instructions
│   ├── default_100_percent/
│   │   └── 100-offline-sprite.png
│   └── default_200_percent/
│       └── 200-offline-sprite.png
│
├── sprite_config.json         # Sprite definitions and dimensions
├── process_ai_sprites.py      # Main processing script
├── pack_sprites.py            # Sprite sheet packer
├── AI_PROMPTS.md              # AI generation guide
└── README_AI_SPRITES.md       # This file
```

## Configuration

### `sprite_config.json`

Defines all sprite types, dimensions, and frame groupings:

```json
{
  "sprite_definitions": {
    "trex": {
      "output_filename": "trex.png",
      "total_dimensions": {"width": 262, "height": 47},
      "frames": [
        {"name": "trex_standing", "width": 44, "height": 47},
        {"name": "trex_blinking", "width": 44, "height": 47},
        ...
      ]
    },
    ...
  },
  "processing_config": {
    "background_detection": {
      "edge_sample_percent": 5,
      "color_threshold": 30,
      "crop_padding": 2
    },
    ...
  }
}
```

**Customization:**
- Adjust `edge_sample_percent` if background detection fails
- Increase `color_threshold` for noisy backgrounds
- Modify `crop_padding` for tighter/looser crops

## Advanced Usage

### Process Specific Sprites Only

```bash
# Process only T-Rex sprites
python process_ai_sprites.py --sprites trex

# Process multiple specific types
python process_ai_sprites.py --sprites trex pterodactyl cactus_small
```

### Custom Directories

```bash
# Process from custom location
python process_ai_sprites.py --input my_images/ --output my_output/

# Pack from custom location
python pack_sprites.py --input my_sprites/ --output my_sheets/
```

### Preview Before Packing

```bash
# Generate preview image with all sprites
python process_ai_sprites.py --preview

# Check processed_sprites/preview.png
open processed_sprites/preview.png
```

## Processing Algorithm Details

### 1. Background Detection
- Samples pixels from edges (top, bottom, left, right)
- Calculates median RGB value as background color
- Robust against noise and compression artifacts

### 2. Auto-Crop
- Creates binary mask: pixels differing from background by threshold
- Finds axis-aligned bounding box of all non-background pixels
- Adds configurable padding around sprite
- Handles edge cases (empty images, full-image sprites)

### 3. Intelligent Resize
- Calculates source and target aspect ratios
- If mismatch > 1%, center-crops to target aspect first
- Resizes using LANCZOS (high-quality resampling)
- Warns if large aspect ratio differences detected

### 4. Frame Grouping
- Loads all frames for a sprite type
- Creates blank canvas (sum of frame widths × max height)
- Pastes frames horizontally at correct offsets
- Validates final dimensions match config

## Sprite Dimensions Reference

| Sprite | Dimensions | Frames | Layout |
|--------|-----------|--------|--------|
| **restart** | 36×32 | 1 | Single |
| **cloud** | 46×14 | 1 | Single |
| **pterodactyl** | 92×40 | 2 | Horizontal strip (46px each) |
| **cactus_small** | 51×35 | 3 | Horizontal strip (17px each) |
| **cactus_large** | 75×50 | 3 | Horizontal strip (25px each) |
| **moon** | 160×40 | 7 | Horizontal strip (~20px each) |
| **star** | 9×9 | 1 | Single |
| **numbers** | 191×13 | 1 | Single (contains 0-9, H, I, GAME OVER) |
| **trex** | 262×47 | 6 | Horizontal strip (varying widths) |
| **horizon** | 1200×12 | 1 | Single (repeating pattern) |

### T-Rex Frame Breakdown
1. Standing (44×47) - offset 0
2. Blinking (44×47) - offset 44
3. Running 1 (44×47) - offset 88
4. Running 2 (44×47) - offset 132
5. Crashed (44×47) - offset 220
6. Ducking 1 (59×47) - offset 264
7. Ducking 2 (59×47) - offset 323

## Troubleshooting

### "Input file not found for 'sprite_name'"
**Solution:** Check filename matches exactly (case-sensitive):
```bash
ls ai_generated/
# Should show: trex_standing.png (not Trex_Standing.png or trex-standing.png)
```

### "Warning: Large aspect ratio difference"
**Solution:** AI generated wrong proportions. Check:
- For wide sprites (cloud, horizon): mention "wide horizontal" in prompt
- For tall sprites: mention "tall vertical" in prompt
- Pipeline will center-crop, but sprite may be cut off

### "No sprite content detected"
**Solution:** Background detection failed. Possible causes:
- Background isn't solid color
- Sprite too similar to background color
- Sprite too small in image
**Fix:** Adjust `color_threshold` in `sprite_config.json` or regenerate with clearer background

### Sprites look squashed/stretched
**Solution:** AI generated wrong aspect ratio and center-crop didn't help
**Fix:** Regenerate with better aspect ratio guidance, or manually crop before processing

### Animation frames don't look consistent
**Solution:** AI generated different styles for different frames
**Fix:** Regenerate all frames in same session with identical base prompt

## Performance Tips

- **Parallel processing:** Process sprite types independently, can be parallelized
- **Incremental updates:** Process only changed sprites with `--sprites` flag
- **Preview often:** Use `--preview` to catch issues before packing

## Examples

### Example 1: Full Pipeline

```bash
# 1. Generate 27 sprites with Gemini (manual)
# See AI_PROMPTS.md for example prompts

# 2. Process all sprites
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/ --preview

# 3. Review preview
open processed_sprites/preview.png

# 4. Pack into sprite sheet
python pack_sprites.py --input processed_sprites/ --output output/

# 5. Deploy to game
cp output/default_100_percent/100-offline-sprite.png assets/default_100_percent/
cp output/default_200_percent/200-offline-sprite.png assets/default_200_percent/
open index.html
```

### Example 2: Iterative Workflow

```bash
# Generate and test just T-Rex first
python process_ai_sprites.py --sprites trex --preview
open processed_sprites/preview.png

# If looks good, generate obstacles
python process_ai_sprites.py --sprites cactus_small cactus_large pterodactyl

# Then backgrounds
python process_ai_sprites.py --sprites cloud star moon horizon

# Finally UI
python process_ai_sprites.py --sprites restart numbers

# Pack all together
python pack_sprites.py --input processed_sprites/ --output output/
```

## Theme Ideas

Using this pipeline, you can create custom themes like:

- **Sci-fi**: Robot T-Rex, spaceships instead of pterodactyls, alien plants
- **Underwater**: Fish, jellyfish, coral obstacles, bubbles
- **Fantasy**: Dragon, griffins, magical trees, crystals
- **Seasonal**: Halloween zombies, Christmas decorations, winter snowmen
- **Minimalist**: Geometric shapes, solid colors, abstract obstacles
- **Retro Console**: Specific pixel art style (NES, Game Boy, Atari)

See **AI_PROMPTS.md** for prompt variations for different styles.

## Contributing

To add new sprite types or modify dimensions:

1. Update `sprite_config.json` with new sprite definition
2. Update `pack_sprites.py` SPRITE_MAP if changing coordinates
3. Update `AI_PROMPTS.md` with generation guide for new sprite
4. Update canvas size if needed (CANVAS_WIDTH, CANVAS_HEIGHT)

## Credits

- **Original Game**: Chromium T-Rex Runner
- **Pipeline**: AI sprite replacement automation
- **Image Processing**: Pillow (PIL), NumPy

## License

Same as original T-Rex Runner (see main README)

---

Happy sprite generating! 🎨🦖✨

For questions or issues, see the main [README.md](README.md) or check individual directory READMEs.
