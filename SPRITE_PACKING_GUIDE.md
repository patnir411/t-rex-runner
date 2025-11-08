# Sprite Packing Guide - Using Original Coordinates

This guide shows you **exactly where to place** your custom sprites to match the original layout.

## Canvas Size

- **LDPI (100%)**: 1233 x 68 pixels minimum
- **HDPI (200%)**: 2404 x 136 pixels minimum (everything doubled)

## LDPI Sprite Positions (100-offline-sprite.png)

Create a canvas and place your sprites at these exact coordinates:

| Sprite | X | Y | Width | Height | Notes |
|--------|---|---|-------|--------|-------|
| **RESTART** | 2 | 2 | 36 | 32 | Restart button icon |
| **CLOUD** | 86 | 2 | 46 | 14 | Background cloud |
| **PTERODACTYL** | 134 | 2 | 92 | 40 | 2 frames (46px each) side-by-side |
| **CACTUS_SMALL** | 228 | 2 | 51 | 35 | 3 variations (17px each) |
| **CACTUS_LARGE** | 332 | 2 | 75 | 50 | 3 variations (25px each) |
| **MOON** | 484 | 2 | 160 | 40 | 7 phases (various widths) |
| **STAR** | 645 | 2 | 9 | 9 | Single star |
| **TEXT_SPRITE** | 655 | 2 | 191 | 13 | Numbers 0-9, H, I, GAME OVER |
| **TREX** | 848 | 2 | 262 | 47 | 6 frames (44px each frame) |
| **HORIZON** | 2 | 54 | 1200 | 12 | Ground line (2 variations) |

### TREX Frame Breakdown (starts at x:848, y:2)

The T-Rex sprite is 262px wide total, containing 6 different poses:

| Frame | X Offset | Purpose |
|-------|----------|---------|
| Frame 0 | 0 | Standing/Jumping (44px wide) |
| Frame 44 | 44 | Waiting blink closed (44px wide) |
| Frame 88 | 88 | Running frame 1 (44px wide) |
| Frame 132 | 132 | Running frame 2 (44px wide) |
| Frame 220 | 220 | Crashed (42px wide) |
| Frame 264/323 | 264, 323 | Ducking frames (59px wide each) |

**Layout in sprite sheet:**
```
Position 848: [Standing][Blink][Run1][Run2][Crashed][Duck1][Duck2]
              0        44     88    132   220     264    323
```

### TEXT_SPRITE Breakdown (starts at x:655, y:2)

Numbers 0-9 plus HI text for high score. Each digit is 10px wide, 13px tall.

## HDPI Sprite Positions (200-offline-sprite.png)

Same layout but **everything doubled** (2x positions, 2x sizes):

| Sprite | X | Y | Width | Height |
|--------|---|---|-------|--------|
| **RESTART** | 4 | 4 | 72 | 64 |
| **CLOUD** | 166 | 2 | 92 | 28 |
| **PTERODACTYL** | 260 | 2 | 184 | 80 |
| **CACTUS_SMALL** | 446 | 2 | 102 | 70 |
| **CACTUS_LARGE** | 652 | 2 | 150 | 100 |
| **MOON** | 954 | 2 | 320 | 80 |
| **STAR** | 1276 | 2 | 18 | 18 |
| **TEXT_SPRITE** | 1294 | 2 | 382 | 26 |
| **TREX** | 1678 | 2 | 524 | 94 |
| **HORIZON** | 2 | 104 | 2400 | 24 |

## Step-by-Step Packing Process

### Option 1: Photoshop/GIMP (Manual Placement)

1. **Create new canvas**
   ```
   File → New
   Width: 1233px
   Height: 68px
   Background: Transparent
   ```

2. **Enable pixel grid and rulers**
   ```
   View → Rulers (Ctrl/Cmd + R)
   View → Show Grid
   Preferences → Grid → Set to 1px grid
   ```

3. **Place each sprite** using the table above:

   **Example: Placing T-Rex**
   - Open your custom T-Rex sprite
   - Copy it
   - Paste into the main canvas
   - Move layer so top-left corner is at **exactly** X:848, Y:2
   - Use the Transform tool (Ctrl/Cmd + T) and look at X/Y values

   **Example: Placing Small Cactus**
   - Your small cactus should be 17px wide, 35px tall
   - Place it at X:228, Y:2
   - If you have 3 variations, place them side-by-side:
     - Variation 1: X:228
     - Variation 2: X:245 (228 + 17)
     - Variation 3: X:262 (245 + 17)

4. **Verify positions**
   - Use ruler/grid to confirm exact pixel positions
   - Select each layer and check X/Y in properties panel

5. **Export**
   ```
   File → Export As
   Format: PNG
   Name: 100-offline-sprite.png
   Save to: assets/default_100_percent/
   ```

6. **Create HDPI version**
   - Image → Scale Image
   - Width: 2466px (1233 × 2)
   - Height: 136px (68 × 2)
   - Interpolation: None (hard edges) or Cubic (smooth)
   - Export as: 200-offline-sprite.png
   - Save to: assets/default_200_percent/

### Option 2: Template Method (Easiest!)

1. **Download original sprite sheet** as template
   - Open `assets/default_100_percent/100-offline-sprite.png`

2. **Use it as a guide**
   - In Photoshop/GIMP, create new layer above it
   - Draw your sprites directly over the originals
   - They'll be in the right positions automatically
   - Delete the original layer when done

3. **Export** your new sheet

### Option 3: Python Script (Automated)

Create a script to pack your individual sprites:

```python
from PIL import Image

# Create blank sprite sheet
sprite_sheet = Image.new('RGBA', (1233, 68), (0, 0, 0, 0))

# Define your sprites and positions
sprites = {
    'restart.png': (2, 2),
    'cloud.png': (86, 2),
    'pterodactyl.png': (134, 2),
    'cactus_small.png': (228, 2),
    'cactus_large.png': (332, 2),
    'moon.png': (484, 2),
    'star.png': (645, 2),
    'numbers.png': (655, 2),
    'trex.png': (848, 2),
    'horizon.png': (2, 54)
}

# Paste each sprite at its position
for filename, (x, y) in sprites.items():
    sprite = Image.open(f'my_sprites/{filename}')
    sprite_sheet.paste(sprite, (x, y), sprite)

# Save
sprite_sheet.save('assets/default_100_percent/100-offline-sprite.png')

# Create HDPI version (2x scale)
hdpi = sprite_sheet.resize((2466, 136), Image.NEAREST)
hdpi.save('assets/default_200_percent/200-offline-sprite.png')
```

### Option 4: Free Online Tool - Piskel

1. Go to https://www.piskelapp.com/
2. Create canvas: 1233 x 68
3. Use the "Import" feature to bring in your individual sprites
4. Position them using the coordinate guide above
5. Export as PNG

## Individual Sprite Requirements

When creating your individual sprites, make them these exact sizes:

### Must-Have Sprites

| Sprite | Width | Height | Notes |
|--------|-------|--------|-------|
| **T-Rex (standing)** | 44px | 47px | Main character pose |
| **T-Rex (running 1)** | 44px | 47px | Leg animation frame 1 |
| **T-Rex (running 2)** | 44px | 47px | Leg animation frame 2 |
| **T-Rex (ducking)** | 59px | 47px | Optional but recommended |
| **T-Rex (crashed)** | 44px | 47px | Death animation |
| **Small Obstacle** | 17px | 35px | Like small cactus |
| **Large Obstacle** | 25px | 50px | Like large cactus |
| **Numbers (0-9)** | 10px each | 13px | For score display |
| **Restart Icon** | 36px | 32px | Restart button |

### Optional Sprites

| Sprite | Width | Height | Notes |
|--------|-------|--------|-------|
| **Flying Obstacle** | 46px | 40px | Like pterodactyl (2 frames) |
| **Cloud** | 46px | 14px | Background decoration |
| **Moon** | varies | 40px | Night mode (7 phases) |
| **Star** | 9px | 9px | Night mode |
| **Horizon** | 600px | 12px | Ground texture (2 types) |

## Quick Checklist

Before you start packing:

- [ ] All your sprites are created at the correct sizes
- [ ] You have transparent backgrounds (PNG with alpha)
- [ ] You know which tool you'll use (Photoshop/GIMP/Python/etc)
- [ ] You have the original sprite sheet open as reference

## Common Mistakes to Avoid

1. **Wrong canvas size** - Make sure it's 1233 x 68 (not 1200 x 68!)
2. **Off-by-one pixel** - Position must be EXACT. X:848 not X:849
3. **Wrong sprite size** - T-Rex must be 44x47, not 45x48
4. **Forgot transparent background** - Use PNG with alpha channel
5. **Didn't create HDPI version** - Game needs both 1x and 2x versions

## Testing Your Sprite Sheet

1. Replace the file: `assets/default_100_percent/100-offline-sprite.png`
2. Open `index.html` in browser
3. Check if everything appears correctly
4. Common issues:
   - **Sprites cut off**: Position is wrong
   - **Nothing shows**: Forgot transparent background
   - **Blurry on retina**: Forgot HDPI version
   - **Wrong animation**: Wrong sprite at wrong position

## Pro Tip: Visual Guide

Open both your blank canvas AND the original sprite sheet side-by-side:

```
Your Canvas (being created)     Original Sprite Sheet (reference)
┌─────────────────────┐        ┌─────────────────────┐
│  [place here]       │        │  [T-Rex at 848,2]   │
│                     │   ←──  │                     │
│                     │ copy   │                     │
└─────────────────────┘ position└─────────────────────┘
```

Measure the original, place yours at the same coordinates!