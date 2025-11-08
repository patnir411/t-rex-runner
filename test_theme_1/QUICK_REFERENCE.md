# Quick Reference - Cyber T-Rex Test

## 🚀 Quick Commands

### Minimal Test (T-Rex only)
```bash
# Process
python process_ai_sprites.py --input test_theme_1/ai_generated/ --output test_theme_1/processed_sprites/ --sprites trex --preview

# Check preview
open test_theme_1/processed_sprites/preview.png
```

### Full Theme Test
```bash
# Process all
python process_ai_sprites.py --input test_theme_1/ai_generated/ --output test_theme_1/processed_sprites/ --preview

# Pack
python pack_sprites.py --input test_theme_1/processed_sprites/ --output test_theme_1/output/

# Deploy
cp test_theme_1/output/default_100_percent/100-offline-sprite.png assets/default_100_percent/
cp test_theme_1/output/default_200_percent/200-offline-sprite.png assets/default_200_percent/

# Test
open index.html

# Restore original
cp assets/default_100_percent.backup/100-offline-sprite.png assets/default_100_percent/
cp assets/default_200_percent.backup/200-offline-sprite.png assets/default_200_percent/
```

## 📋 Required Files (Minimal T-Rex Test)

Place in `test_theme_1/ai_generated/`:

1. `trex_standing.png` - Standing/jumping pose
2. `trex_blinking.png` - Eyes closed
3. `trex_running_1.png` - Left leg forward
4. `trex_running_2.png` - Right leg forward
5. `trex_crashed.png` - Lying dead
6. `trex_ducking_1.png` - Ducking frame 1
7. `trex_ducking_2.png` - Ducking frame 2

## 📋 Required Files (Full Theme - 27 total)

**T-Rex (7):** Above list

**Pterodactyl (2):**
- `pterodactyl_1.png`, `pterodactyl_2.png`

**Obstacles (6):**
- `cactus_small_1.png`, `cactus_small_2.png`, `cactus_small_3.png`
- `cactus_large_1.png`, `cactus_large_2.png`, `cactus_large_3.png`

**Moon (7):**
- `moon_phase_1.png` through `moon_phase_7.png`

**Backgrounds (2):**
- `cloud.png`, `star.png`

**Ground (1):**
- `horizon.png`

**UI (2):**
- `restart.png`, `numbers.png`

## ✅ Success Criteria

### After Processing
```bash
ls test_theme_1/processed_sprites/
```
Should show:
- `trex.png` (262×47 pixels)
- `preview.png` (visual verification)
- Other sprites if full theme

### After Packing
```bash
ls test_theme_1/output/default_100_percent/
ls test_theme_1/output/default_200_percent/
```
Should show:
- `100-offline-sprite.png` (1233×68)
- `200-offline-sprite.png` (2466×136)

### In Game
- Robot T-Rex appears
- Running animation smooth
- Ducking works (down arrow)
- Jump works (space)
- Collisions work
- Score displays

## 🎨 Quick Prompt Template

```
Robot T-Rex [pose description], cyberpunk style, pixel art, 8-bit retro game sprite,
mechanical dinosaur with glowing neon blue circuits, metallic body, [specific details],
side view facing right, centered on white background, simple sprite
```

Replace `[pose description]` and `[specific details]` with:
- **Standing:** `standing upright` + `small robot arms, thick robot legs`
- **Running 1:** `running, left leg forward` + `running pose`
- **Running 2:** `running, right leg forward` + `only leg positions different`
- **Ducking:** `ducking low to ground, crouched` + `head lowered, wide horizontal sprite`
- **Crashed:** `crashed and broken on ground` + `sparks or glitches, fallen over`
- **Blinking:** `same as standing` + `but eyes turned off or dimmed`

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| File not found | Check filename case-sensitivity |
| Wrong dimensions | Check AI prompt or regenerate |
| Frames inconsistent | Regenerate in same AI session |
| Background not removed | Adjust color_threshold in sprite_config.json |
| Aspect ratio warning | Add "wide horizontal" or "tall vertical" to prompt |

## 📁 File Sizes Reference

AI-generated images: ~200KB - 2MB each (depends on AI service)
Processed sprites: ~1-10KB each (PNG with transparency)
Final sprite sheet: ~3-5KB (LDPI), ~6-10KB (HDPI)

## 🔍 Verify Commands

```bash
# Check image dimensions
file test_theme_1/processed_sprites/trex.png
# Should output: PNG image data, 262 x 47, 8-bit/color RGBA

# Check file exists
ls test_theme_1/ai_generated/trex_standing.png

# Count generated files
ls test_theme_1/ai_generated/*.png | wc -l
# Should show: 7 (minimal) or 27 (full)
```

## 📖 Full Documentation

- **Complete prompts:** `CYBER_TREX_THEME.md`
- **Setup instructions:** `README.md`
- **Pipeline docs:** `../README_AI_SPRITES.md`
- **General prompting:** `../AI_PROMPTS.md`

---

**TIP:** Start with just T-Rex (7 sprites) to validate the pipeline before generating all 27 sprites!
