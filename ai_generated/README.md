# AI Generated Sprites

Place your raw AI-generated sprite images in this directory.

## File Naming Convention

Name your files according to the sprite type and frame. See `sprite_config.json` for the complete list.

### Single-Frame Sprites
- `restart.png` - Restart button icon
- `cloud.png` - Background cloud
- `star.png` - Night mode star
- `horizon.png` - Ground texture (1200x12 repeating pattern)
- `numbers.png` - Digits 0-9, H, I, and "GAME OVER" text (191x13)

### Multi-Frame Sprites

#### T-Rex (6 frames)
- `trex_standing.png` - Standing/jumping pose
- `trex_blinking.png` - Blinking (eyes closed, body identical to standing)
- `trex_running_1.png` - Running animation frame 1
- `trex_running_2.png` - Running animation frame 2
- `trex_crashed.png` - Dead/crashed pose
- `trex_ducking_1.png` - Ducking animation frame 1
- `trex_ducking_2.png` - Ducking animation frame 2

#### Pterodactyl (2 frames)
- `pterodactyl_1.png` - Wings up
- `pterodactyl_2.png` - Wings down

#### Cactus Small (3 variations)
- `cactus_small_1.png` - Variation 1
- `cactus_small_2.png` - Variation 2
- `cactus_small_3.png` - Variation 3

#### Cactus Large (3 variations)
- `cactus_large_1.png` - Variation 1
- `cactus_large_2.png` - Variation 2
- `cactus_large_3.png` - Variation 3

#### Moon (7 phases)
- `moon_phase_1.png` - Phase 1 (new moon)
- `moon_phase_2.png` - Phase 2
- `moon_phase_3.png` - Phase 3
- `moon_phase_4.png` - Phase 4 (full moon)
- `moon_phase_5.png` - Phase 5
- `moon_phase_6.png` - Phase 6
- `moon_phase_7.png` - Phase 7

## Image Requirements

- **Format**: PNG or JPG
- **Size**: Any square size (e.g., 512x512, 1024x1024) - the pipeline will auto-crop and resize
- **Background**: Solid color (white, cream, any solid color) - will be automatically removed
- **Style**: Pixel art recommended for best results
- **Content**: Sprite should be centered in the image

## Processing

Once you've added your images, run:

```bash
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/
```

This will:
1. Auto-detect and remove background
2. Crop to sprite bounds
3. Resize to exact game dimensions
4. Combine multi-frame sprites into strips
5. Output to `processed_sprites/`
