# ⚡ Gemini Sprite Pipeline - Quick Start

**Generate a complete T-Rex Runner theme in 5 minutes**

✨ **NEW: Image-to-Image Consistency** - Uses reference images for perfect character matching across animation frames!

---

## 1. Install (30 seconds)

```bash
# Python packages
pip install Pillow numpy

# Node packages
npm install
```

---

## 2. Get API Key (1 minute)

1. Visit https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy your key

```bash
export GEMINI_API_KEY="paste-your-key-here"
```

---

## 3. Generate Theme (3-5 minutes)

```bash
ts-node run_pipeline.ts --full --theme=cyberpunk --backup
```

**That's it!** The pipeline will:
- ✅ Generate 27 sprites with AI (~3-5 min) **with perfect character consistency!**
- ✅ Process and pack them
- ✅ Validate alignment
- ✅ Deploy to game

**🎨 Image-to-image consistency is enabled by default** - ensures all T-Rex frames look like the same character!

---

## 4. Play! (now)

```bash
open index.html
# or
python -m http.server 8000  # then visit http://localhost:8000
```

---

## Available Themes

```bash
# Classic retro (default)
ts-node run_pipeline.ts --full --theme=retro

# Neon cyberpunk
ts-node run_pipeline.ts --full --theme=cyberpunk

# Medieval fantasy
ts-node run_pipeline.ts --full --theme=fantasy

# Ocean underwater
ts-node run_pipeline.ts --full --theme=underwater

# Cosmic space
ts-node run_pipeline.ts --full --theme=space
```

---

## Manual Steps (if you want control)

```bash
# 1. Generate (pick a theme)
ts-node generate_sprites_gemini.ts --theme=cyberpunk --parallel=3

# 2. Process
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/

# 3. Pack
python pack_sprites.py --input processed_sprites/ --output output/

# 4. Validate
python validate_sprites.py --visualize

# 5. Deploy
cp output/default_*_percent/*.png assets/default_*_percent/
```

---

## Cost

**~$1.05 per theme** (27 sprites × $0.039 each)

**Free tier:** 500 requests/day (can generate many themes!)

---

## Troubleshooting

### "GEMINI_API_KEY not set"
```bash
export GEMINI_API_KEY="your-key"
```

### "Cannot find module"
```bash
npm install
```

### "No module named 'PIL'"
```bash
pip install Pillow numpy
```

---

## What Gets Generated

```
ai_generated/           # 27 raw AI images (1024×1024)
processed_sprites/      # 27 processed sprites (exact dimensions)
output/                 # Final sprite sheets (LDPI + HDPI)
assets/                 # Deployed to game ✅
```

---

## More Info

- **Full docs:** [README_GEMINI_PIPELINE.md](README_GEMINI_PIPELINE.md)
- **Image-to-image:** [IMAGE_TO_IMAGE_CONSISTENCY.md](IMAGE_TO_IMAGE_CONSISTENCY.md) ← **Learn about perfect consistency!**
- **Setup:** [SETUP.md](SETUP.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)

---

**That's it! Now go create amazing themes!** 🎨🦖
