# Gemini 2.5 Flash Image Sprite Generation Pipeline

**Automated end-to-end AI sprite generation for T-Rex Runner**

This pipeline uses Google's **Gemini 2.5 Flash Image** (nicknamed "nano-banana") to automatically generate pixel-perfect game sprites with parallel batch processing and comprehensive validation.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Python dependencies (for processing)
pip install Pillow numpy

# Node.js dependencies (for AI generation)
npm install
```

### 2. Set API Key

```bash
export GEMINI_API_KEY="your-api-key-here"
```

Get your API key from: https://aistudio.google.com/apikey

### 3. Run Complete Pipeline

```bash
# Generate complete retro theme
ts-node run_pipeline.ts --full

# Generate custom theme
ts-node run_pipeline.ts --full --theme=cyberpunk --backup
```

### 4. Play!

```bash
open index.html
# or
python -m http.server 8000
```

---

## 🎨 Available Themes

The generator includes optimized prompts for multiple themes:

- **`retro`** (default) - Classic Chrome dinosaur game aesthetic
- **`cyberpunk`** - Neon colors, futuristic style
- **`fantasy`** - Medieval RPG theme with magical elements
- **`underwater`** - Ocean/aquatic theme
- **`space`** - Cosmic sci-fi theme

You can also create custom themes by editing `generate_sprites_gemini.ts`.

---

## 📋 Pipeline Stages

### **Stage 1: AI Generation** ✨

```bash
ts-node generate_sprites_gemini.ts --theme=cyberpunk --parallel=5
```

**What it does:**
- Generates **27 sprites** using Gemini 2.5 Flash Image
- Uses optimized prompts based on Google's best practices:
  - Narrative-driven detailed descriptions
  - Explicit background specification ("solid white background")
  - Photographic/cinematic composition control
  - Aspect ratio hints for proper proportions
- **Parallel batch processing** for speed (default: 3 at a time)
- Saves to `ai_generated/` directory

**Features:**
- ✅ Parallel generation (configurable batch size)
- ✅ Automatic retry on failure
- ✅ Progress tracking
- ✅ Cost estimation
- ✅ Theme-based prompt optimization

**Output:** 27 PNG files (1024×1024 each) with off-white backgrounds

**Estimated time:** 3-5 minutes for all 27 sprites (with batch size 3)
**Estimated cost:** ~$1.05 (27 sprites × $0.039 per image)

---

### **Stage 2: Processing** 🔧

```bash
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/ --preview
```

**What it does:**
- **Background removal:** Detects and removes background color (handles off-white from Gemini)
- **Auto-crop:** Removes empty space around sprites
- **Intelligent resize:** Resizes to exact game dimensions with aspect ratio preservation
- **Frame combination:** Combines multi-frame sprites (running, ducking, wings) into horizontal strips
- **Validation:** Ensures dimensions match expected values

**Enhanced for Gemini:**
- ✅ Handles off-white backgrounds (not pure white)
- ✅ Edge-based background color detection
- ✅ Gradient alpha for smooth edges
- ✅ Bottom-alignment for ground-based characters (T-Rex feet touch ground)
- ✅ Preview image generation

**Output:** Processed sprites in exact game dimensions in `processed_sprites/`

---

### **Stage 3: Packing** 📦

```bash
python pack_sprites.py --input processed_sprites/ --output output/
```

**What it does:**
- Places sprites at **exact pixel coordinates** from `Runner.spriteDefinition`
- Generates both **LDPI** (1233×68) and **HDPI** (2466×136) sprite sheets
- Validates sprite placement
- Creates debug images showing sprite positions

**Critical for collision detection:**
- ✅ Pixel-perfect positioning
- ✅ Exact frame offsets for T-Rex animations
- ✅ Proper alignment for collision boxes

**Output:**
- `output/default_100_percent/100-offline-sprite.png`
- `output/default_200_percent/200-offline-sprite.png`

---

### **Stage 4: Validation** ✔️

```bash
python validate_sprites.py --processed processed_sprites/ --output output/ --visualize
```

**What it does:**
- Validates **all sprite dimensions** match expected values
- Checks **transparency levels** (detects background removal issues)
- Validates **sprite sheet dimensions**
- Confirms **sprite positions** in sprite sheet
- Creates **collision box visualizations**

**Validation checks:**
- ✅ Processed sprite dimensions
- ✅ Sprite sheet dimensions (LDPI & HDPI)
- ✅ Sprite positions in sprite sheet
- ✅ Transparency coverage
- ✅ Collision box alignment

**Output:**
- Console validation report
- `output/collision_boxes_ldpi.png` - Visual collision box overlay
- `output/collision_boxes_hdpi.png` - HDPI version

---

### **Stage 5: Deployment** 🚀

```bash
# Manual deployment
cp output/default_100_percent/100-offline-sprite.png assets/default_100_percent/
cp output/default_200_percent/200-offline-sprite.png assets/default_200_percent/
```

**What it does:**
- Backs up original sprites (optional)
- Copies new sprite sheets to `assets/` directories
- Game is ready to play!

---

## 🎯 Usage Examples

### Complete Pipeline (Recommended)

```bash
# Cyberpunk theme with backup
ts-node run_pipeline.ts --full --theme=cyberpunk --backup

# Custom batch size for faster generation
ts-node run_pipeline.ts --full --theme=fantasy --parallel=5
```

### Individual Stages

```bash
# Generate sprites only (for testing prompts)
ts-node generate_sprites_gemini.ts --theme=space

# Process existing sprites
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/

# Pack sprites
python pack_sprites.py --input processed_sprites/ --output output/

# Validate only
python validate_sprites.py --visualize
```

### Partial Pipeline

```bash
# Skip generation, use existing sprites
ts-node run_pipeline.ts --process --pack --validate --deploy

# Validate and deploy only
ts-node run_pipeline.ts --validate --deploy --backup
```

---

## 🧠 Understanding the Sprite System

### How Sprites Are Wired to Game

**1. Sprite Sheet Coordinates** (`index.js:163-188`)
```javascript
Runner.spriteDefinition = {
    LDPI: {
        TREX: { x: 848, y: 2 },       // T-Rex starts at pixel 848
        CACTUS_SMALL: { x: 228, y: 2 },
        // ... etc
    }
}
```

**2. Animation Frames** (`index.js:1621-1642`)
```javascript
Trex.animFrames = {
    RUNNING: {
        frames: [88, 132],  // X-offsets within T-Rex sprite strip
        msPerFrame: 1000 / 12
    }
}
```

**3. Collision Boxes** (`index.js:1583-1595`)
```javascript
Trex.collisionBoxes = {
    RUNNING: [
        new CollisionBox(22, 0, 17, 16),  // Head
        new CollisionBox(1, 18, 30, 9),   // Body
        // ... multiple boxes for precise detection
    ]
}
```

### Critical Pixel Requirements

| Requirement | Why It Matters |
|-------------|----------------|
| **Exact dimensions** | Collision boxes are defined in pixels relative to sprite bounds |
| **Exact positions** | Sprite sheet coordinates must match `Runner.spriteDefinition` |
| **Frame offsets** | Animation frame X-positions must be exact (e.g., 88, 132) |
| **Ground alignment** | T-Rex feet must touch ground (`groundYPos` calculation) |
| **Transparency** | Background must be transparent for proper rendering |

### Why Background Removal Matters

Gemini 2.5 Flash Image doesn't generate **pure white** backgrounds despite prompting. The processing pipeline:

1. **Detects background color** by sampling edge pixels
2. **Calculates color distance** for each pixel
3. **Creates gradient alpha** for smooth edges
4. **Crops to content bounds**
5. **Resizes** to exact game dimensions

This ensures sprites work correctly with the game's collision detection and rendering.

---

## 🔬 Advanced Features

### Custom Prompts

Edit `generate_sprites_gemini.ts` and modify the `getSpritePrompts()` function:

```typescript
{
  filename: 'trex_standing.png',
  prompt: `Your custom prompt here. ${style}. ${basePromptSuffix}`,
  aspectRatio: '1:1',
  expectedDimensions: { width: 44, height: 47 }
}
```

### Gemini 2.5 Flash Image Best Practices

Based on official Google documentation:

✅ **DO:**
- Use narrative-driven detailed descriptions
- Specify "solid white background" explicitly
- Use photographic terms (macro shot, wide-angle, etc.)
- Mention aspect ratio in prompt for non-square sprites
- Keep consistency across animation frames

❌ **DON'T:**
- Use keyword lists without context
- Assume pure white background (it will be off-white)
- Over-specify shadows or gradients (keep it flat for pixel art)
- Generate text/numbers with Gemini (use actual fonts instead)

### Batch Size Optimization

```bash
# Slower, more respectful of API (default)
ts-node generate_sprites_gemini.ts --parallel=3

# Faster, more API calls in parallel
ts-node generate_sprites_gemini.ts --parallel=5

# Slowest, sequential (for rate limit testing)
ts-node generate_sprites_gemini.ts --parallel=1
```

**Note:** Pipeline includes 2-second delays between batches to be respectful of API.

### Processing Configuration

Edit `sprite_config.json` to adjust:

```json
{
  "processing_config": {
    "background_detection": {
      "edge_sample_percent": 5,    // % of edges to sample for bg color
      "color_threshold": 30,        // RGB distance threshold
      "crop_padding": 2             // Padding around cropped sprite
    },
    "resize_quality": "LANCZOS",    // High-quality resampling
    "validation": {
      "min_sprite_coverage": 0.05,  // Min % of non-transparent pixels
      "warn_aspect_ratio_diff": 0.2 // Warn if aspect ratio differs >20%
    }
  }
}
```

---

## 📊 Sprite Specifications

### All 27 Required Sprites

| Sprite | Dimensions | Frames | Notes |
|--------|-----------|--------|-------|
| **T-Rex** | | | |
| `trex_standing.png` | 44×47 | 1 | Standing/jumping pose |
| `trex_blinking.png` | 44×47 | 1 | Eyes closed only |
| `trex_running_1.png` | 44×47 | 1 | Left leg forward |
| `trex_running_2.png` | 44×47 | 1 | Right leg forward |
| `trex_crashed.png` | 44×47 | 1 | Game over pose |
| `trex_ducking_1.png` | 59×47 | 1 | Ducking frame 1 (wider!) |
| `trex_ducking_2.png` | 59×47 | 1 | Ducking frame 2 (wider!) |
| **Pterodactyl** | | | |
| `pterodactyl_1.png` | 46×40 | 1 | Wings up |
| `pterodactyl_2.png` | 46×40 | 1 | Wings down |
| **Cacti** | | | |
| `cactus_small_1/2/3.png` | 17×35 | 3 | Three variations |
| `cactus_large_1/2/3.png` | 25×50 | 3 | Three variations |
| **Moon** | | | |
| `moon_phase_1-7.png` | 20×40 | 7 | Seven phases |
| **UI/Background** | | | |
| `cloud.png` | 46×14 | 1 | Very wide! |
| `star.png` | 9×9 | 1 | Very small! |
| `horizon.png` | 1200×12 | 1 | VERY wide! Tileable pattern |
| `restart.png` | 36×32 | 1 | Button icon |
| `numbers.png` | 191×13 | 1 | All digits, HI, GAME OVER |

**Total: 27 sprites** (some have multiple frames)

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY not set"

```bash
export GEMINI_API_KEY="your-api-key"
# or add to ~/.bashrc or ~/.zshrc
```

### "No content at position (x, y)"

**Cause:** Sprite didn't pack correctly or background wasn't removed

**Fix:**
1. Check `processed_sprites/` - does sprite look correct?
2. Re-run processing: `python process_ai_sprites.py --input ai_generated/ --output processed_sprites/`
3. Check `sprite_config.json` background detection settings

### "Dimension mismatch"

**Cause:** AI generated wrong aspect ratio or processing failed

**Fix:**
1. Check original AI image in `ai_generated/`
2. Improve prompt with aspect ratio hint
3. Manually edit `sprite_config.json` thresholds

### "Low transparency warning"

**Cause:** Background removal didn't work (background too close to sprite color)

**Fix:**
1. Increase `color_threshold` in `sprite_config.json`
2. Regenerate sprite with clearer background in prompt
3. Manually edit sprite in image editor

### Collision detection broken in game

**Cause:** Sprite dimensions or positions are off by even 1 pixel

**Fix:**
1. Run validation: `python validate_sprites.py --visualize`
2. Check `output/collision_boxes_*.png` visuals
3. Verify sprite dimensions in `processed_sprites/`
4. Re-run packing if needed

---

## 💰 Cost Estimation

**Gemini 2.5 Flash Image Pricing:**
- ~1,290 tokens per image
- $0.039 per 1K image (approximate)
- **27 sprites × $0.039 = ~$1.05 per complete theme**

**Free Tier:**
- Google AI Studio: 500 requests/day
- More than enough for multiple themes!

---

## 🎓 Learning Resources

- [Official Gemini 2.5 Flash Image Guide](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs/image-generation)
- [T-Rex Runner Architecture](ARCHITECTURE.md)
- [AI Prompting Guide](AI_PROMPTS.md)
- [Sprite Packing Reference](SPRITE_PACKING_GUIDE.md)

---

## 📝 Files Overview

```
t-rex-runner/
├── generate_sprites_gemini.ts   # 🎨 AI generation (Gemini 2.5 Flash Image)
├── process_ai_sprites.py        # 🔧 Background removal, crop, resize
├── pack_sprites.py              # 📦 Pack into sprite sheets
├── validate_sprites.py          # ✔️  Validate pixel-perfect alignment
├── run_pipeline.ts              # 🚀 End-to-end automation
├── sprite_config.json           # ⚙️  Sprite definitions
├── package.json                 # 📋 Node.js dependencies
├── tsconfig.json                # 📋 TypeScript config
└── README_GEMINI_PIPELINE.md    # 📖 This file
```

---

## ✨ Features Summary

✅ **Automated AI generation** with Gemini 2.5 Flash Image
✅ **Parallel batch processing** for speed
✅ **Optimized prompts** based on Google best practices
✅ **Smart background removal** (handles off-white)
✅ **Pixel-perfect alignment** validation
✅ **Collision box visualization**
✅ **Multi-theme support** (retro, cyberpunk, fantasy, etc.)
✅ **Complete end-to-end automation**
✅ **Backup and deployment** tools
✅ **Comprehensive validation** and error reporting

---

## 🤝 Contributing

Found an issue or have a theme idea? Contributions welcome!

1. Test the pipeline with your theme
2. Document any issues or improvements
3. Share your custom themes!

---

## 📜 License

MIT License - Same as original T-Rex Runner

---

**Happy sprite generating!** 🦖✨

*Powered by Gemini 2.5 Flash Image ("nano-banana") - Google's state-of-the-art image generation model*
