# Cyber T-Rex Theme - Test Pipeline

**Theme:** Cyberpunk/Robot T-Rex - A futuristic, neon-lit version of the Chrome dinosaur game.

**Style:** Pixel art, cyberpunk aesthetic, neon colors, robot/mechanical design, retro game sprite style.

## Quick Test Setup

This theme focuses on the **T-Rex character** as the primary test subject. Once validated, you can generate the rest.

### Test Workflow

1. **Generate T-Rex sprites** using prompts below
2. **Save to:** `test_theme_1/ai_generated/`
3. **Process:** Run processing script with custom input/output
4. **Validate:** Check processed sprites match expected dimensions
5. **Pack & Deploy:** Create sprite sheet and test in game

## AI Generation Prompts

### 🤖 Core Character: Cyber T-Rex (7 sprites)

#### 1. Standing/Jumping Pose
**Filename:** `trex_standing.png`

**Prompt:**
```
Robot T-Rex dinosaur standing upright, cyberpunk style, pixel art, 8-bit retro game sprite,
mechanical dinosaur with glowing neon blue circuits, metallic body, small robot arms,
thick robot legs, side view facing right, centered on white background, simple sprite,
clean edges, cyber dinosaur, futuristic chrome game
```

**Expected:** Robotic T-Rex standing on two legs, metallic with neon accents, side view, pixel art style.

---

#### 2. Blinking
**Filename:** `trex_blinking.png`

**Prompt:**
```
Same robot T-Rex from before, identical pose and body, but with glowing eyes turned off or dimmed,
mechanical dinosaur blinking, cyberpunk pixel art, 8-bit retro game sprite, side view,
centered on white background, only eyes different
```

**Expected:** Identical to standing, but eyes (glowing parts) are off/dimmed.

---

#### 3. Running Frame 1
**Filename:** `trex_running_1.png`

**Prompt:**
```
Robot T-Rex running, left leg forward, cyberpunk style, pixel art, 8-bit retro game sprite,
mechanical dinosaur with neon blue circuits, metallic body running pose, side view facing right,
centered on white background, running animation frame 1, futuristic chrome dinosaur
```

**Expected:** Same robot T-Rex but in running pose with left leg forward.

---

#### 4. Running Frame 2
**Filename:** `trex_running_2.png`

**Prompt:**
```
Same robot T-Rex running, right leg forward instead, identical style and mechanical body,
cyberpunk pixel art, 8-bit retro game sprite, side view facing right,
centered on white background, running animation frame 2, only leg positions different
```

**Expected:** Same as running frame 1 but right leg forward (opposite leg position).

---

#### 5. Crashed/Dead
**Filename:** `trex_crashed.png`

**Prompt:**
```
Robot T-Rex crashed and broken on ground, cyberpunk style, pixel art, 8-bit retro game sprite,
mechanical dinosaur fallen over, sparks or glitches, game over pose, lying on ground,
side view, centered on white background, broken robot dinosaur, futuristic game over sprite
```

**Expected:** Robot T-Rex lying defeated on the ground, possibly with sparks/damage effects.

---

#### 6. Ducking Frame 1
**Filename:** `trex_ducking_1.png`

**Prompt:**
```
Robot T-Rex ducking low to ground, crouched position, cyberpunk style, pixel art,
8-bit retro game sprite, mechanical dinosaur with head lowered, wide horizontal sprite,
neon circuits glowing, side view, centered on white background, ducking pose frame 1
```

**Expected:** Wide sprite of robot T-Rex crouching/ducking low.

---

#### 7. Ducking Frame 2
**Filename:** `trex_ducking_2.png`

**Prompt:**
```
Same robot T-Rex ducking, slightly different leg position, identical style and body,
cyberpunk pixel art, 8-bit retro game sprite, mechanical dinosaur crouched low,
side view, centered on white background, ducking animation frame 2
```

**Expected:** Same ducking pose but slight leg variation for animation.

---

## Additional Sprites (Optional - For Full Theme)

### 🦅 Cyber Pterodactyl (2 frames)

#### Pterodactyl Frame 1
**Filename:** `pterodactyl_1.png`
```
Robot pterodactyl flying, mechanical wings spread upward, cyberpunk style, pixel art,
8-bit retro game sprite, flying robot dinosaur with neon accents, side view,
centered on white background, cyber prehistoric flying drone
```

#### Pterodactyl Frame 2
**Filename:** `pterodactyl_2.png`
```
Same robot pterodactyl flying, mechanical wings down, identical body and style,
cyberpunk pixel art, 8-bit retro game sprite, flying drone dinosaur,
side view, centered on white background, wings flapping down
```

---

### 🌵 Cyber Obstacles

#### Small Cyber Obstacle (3 variations)
**Filenames:** `cactus_small_1.png`, `cactus_small_2.png`, `cactus_small_3.png`
```
Futuristic cyber obstacle, small holographic barrier or energy spike, cyberpunk style,
pixel art, 8-bit retro game sprite, neon glowing obstacle, vertical energy barrier,
simple sprite, centered on white background, sci-fi game obstacle
```
*Generate 3 variations with different shapes/patterns*

#### Large Cyber Obstacle (3 variations)
**Filenames:** `cactus_large_1.png`, `cactus_large_2.png`, `cactus_large_3.png`
```
Futuristic cyber obstacle, large holographic barrier or energy tower, cyberpunk style,
pixel art, 8-bit retro game sprite, tall neon glowing obstacle, vertical energy barrier,
simple sprite, centered on white background, sci-fi game obstacle, larger than small version
```
*Generate 3 variations with different shapes/patterns*

---

### ☁️ Background Elements

#### Cyber Cloud
**Filename:** `cloud.png`
```
Futuristic cyber cloud, digital data cloud or hologram, cyberpunk style, pixel art,
8-bit retro game sprite, wide horizontal neon cloud, glowing edges,
centered on white background, digital cloud background element
```

#### Star/Pixel
**Filename:** `star.png`
```
Tiny glowing pixel, cyberpunk style, pixel art, 8-bit retro game sprite,
small neon star or data point, simple glowing pixel sprite,
centered on white background, minimal cyber star
```

#### Moon Phases (7 phases)
**Filenames:** `moon_phase_1.png` through `moon_phase_7.png`
```
# Full moon version (phase 4):
Cyber moon, holographic moon with circuit patterns, cyberpunk style, pixel art,
8-bit retro game sprite, glowing neon moon, digital moon sprite,
centered on white background

# Crescent versions (phases 1-3, 5-7):
Cyber moon crescent, holographic partial moon with circuits, cyberpunk pixel art,
8-bit retro game sprite, glowing neon crescent moon, digital moon sprite,
centered on white background, thin/thick crescent variations
```

#### Horizon/Ground
**Filename:** `horizon.png`
```
Cyber ground texture, digital grid or circuit board pattern, cyberpunk style, pixel art,
8-bit retro game sprite, very wide horizontal texture, neon grid lines, repeating pattern,
futuristic ground line, centered on white background, glowing digital terrain
```

---

### 🎮 UI Elements

#### Restart Button
**Filename:** `restart.png`
```
Cyber restart button, holographic play again icon or circular arrow, cyberpunk style,
pixel art, 8-bit retro game sprite, glowing neon UI button, simple restart icon,
centered on white background, futuristic game UI element
```

#### Numbers and Text
**Filename:** `numbers.png`
```
Futuristic digital numbers 0-9 and letters H and I, cyberpunk style, pixel art,
8-bit retro game font, glowing neon digits, all characters in a row, blocky cyber font,
centered on white background, plus text "GAME OVER" below with digital/glitch effect
```

---

## Testing Instructions

### Phase 1: Test T-Rex Only (Minimal Test)

```bash
# 1. Generate the 7 T-Rex sprites using prompts above
#    Save to: test_theme_1/ai_generated/

# 2. Process just the T-Rex
python process_ai_sprites.py \
  --input test_theme_1/ai_generated/ \
  --output test_theme_1/processed_sprites/ \
  --sprites trex \
  --preview

# 3. Check preview
open test_theme_1/processed_sprites/preview.png

# 4. Verify dimensions
# Expected output: trex.png at 262×47 pixels with 6 frames combined horizontally
```

**Success Criteria:**
- ✓ All 7 T-Rex sprites found and processed
- ✓ No dimension warnings or errors
- ✓ Final `trex.png` is exactly 262×47 pixels
- ✓ Preview shows combined sprite strip
- ✓ Visual inspection: frames look consistent

---

### Phase 2: Full Theme Test (All Sprites)

```bash
# 1. Generate all 27 sprites using prompts above

# 2. Process all sprites
python process_ai_sprites.py \
  --input test_theme_1/ai_generated/ \
  --output test_theme_1/processed_sprites/ \
  --preview

# 3. Pack into sprite sheet
python pack_sprites.py \
  --input test_theme_1/processed_sprites/ \
  --output test_theme_1/output/

# 4. Deploy to game (test in browser)
cp test_theme_1/output/default_100_percent/100-offline-sprite.png assets/default_100_percent/
cp test_theme_1/output/default_200_percent/200-offline-sprite.png assets/default_200_percent/

# 5. Open game
open index.html
```

**Success Criteria:**
- ✓ All sprites processed without errors
- ✓ Sprite sheet created at correct dimensions (1233×68 LDPI)
- ✓ Game loads and runs with new sprites
- ✓ Animations play smoothly (running, ducking, wing flapping)
- ✓ Collisions work correctly
- ✓ Night mode transitions work

---

## Expected Outputs

### After Processing (`test_theme_1/processed_sprites/`)
```
restart.png       36×32
cloud.png         46×14
pterodactyl.png   92×40 (2 frames)
cactus_small.png  51×35 (3 variations)
cactus_large.png  75×50 (3 variations)
moon.png          160×40 (7 phases)
star.png          9×9
numbers.png       191×13
trex.png          262×47 (6 frames) ← PRIMARY TEST SUBJECT
horizon.png       1200×12
preview.png       (visual preview of all sprites)
```

### After Packing (`test_theme_1/output/`)
```
default_100_percent/100-offline-sprite.png  (1233×68)
default_200_percent/200-offline-sprite.png  (2466×136)
```

---

## Troubleshooting for This Theme

### T-Rex frames look too different
**Issue:** AI generated inconsistent robot styles across frames
**Fix:** Regenerate all 7 frames in same AI session, use identical base prompt

### Neon colors too bright/dim
**Issue:** Processing affected color intensity
**Fix:** Colors are preserved, but check original AI images - may need to adjust prompts

### Mechanical details lost in resize
**Issue:** Small details disappeared when resizing to small pixel dimensions
**Fix:** Simplify prompt - add "simple", "minimal details", "clean sprite"

### Background not fully removed
**Issue:** Neon glow creates gradient around sprite
**Fix:** Increase `color_threshold` in sprite_config.json or regenerate with solid background

---

## Theme Variations

You can easily modify this theme by changing the prompt style:

**Neon Cyberpunk:**
```
... neon pink and blue, cyberpunk night city vibe, glowing accents ...
```

**Chrome Metal:**
```
... polished chrome metal, sleek futuristic, silver and black, minimal neon ...
```

**Glitch/Digital:**
```
... glitch effect, digital corruption, pixelated errors, matrix style ...
```

**Tron Style:**
```
... tron legacy style, light cycles, glowing grid lines, black with neon blue ...
```

---

## File Checklist

**Minimal T-Rex Test (7 files):**
- [ ] `trex_standing.png`
- [ ] `trex_blinking.png`
- [ ] `trex_running_1.png`
- [ ] `trex_running_2.png`
- [ ] `trex_crashed.png`
- [ ] `trex_ducking_1.png`
- [ ] `trex_ducking_2.png`

**Full Theme (27 files):**
- [ ] 7 T-Rex sprites (above)
- [ ] 2 Pterodactyl sprites
- [ ] 3 Small obstacle sprites
- [ ] 3 Large obstacle sprites
- [ ] 7 Moon phase sprites
- [ ] 1 Cloud sprite
- [ ] 1 Star sprite
- [ ] 1 Horizon sprite
- [ ] 1 Restart button sprite
- [ ] 1 Numbers/text sprite

---

## Notes

- Save this file for reference when generating sprites
- Copy-paste prompts directly into your AI image generator (Gemini, DALL-E, etc.)
- Generate at highest quality setting available
- For T-Rex test: Focus on getting frames 3-4 (running) visually consistent
- Animation frames need consistent style - generate in same session if possible

---

**Ready to test?** Start with the 7 T-Rex sprites and run Phase 1 testing! 🤖🦖✨
