# AI Sprite Generation Guide

This guide provides example prompts for generating T-Rex Runner sprites using AI image generators like Gemini, DALL-E, Midjourney, or Stable Diffusion.

## General Prompting Strategy

### Base Template

```
[sprite description], pixel art, 8-bit retro game style, centered on white background,
simple sprite, clean edges, no shadows, flat colors, [specific details]
```

### Key Prompting Tips

1. **Specify pixel art style** - Use terms like "pixel art", "8-bit", "16-bit", "retro game sprite"
2. **Request solid background** - "white background", "plain background", "solid color background"
3. **Center the subject** - "centered", "sprite in center of image"
4. **Keep it simple** - AI generators work better with simple, clear descriptions for pixel art
5. **Specify proportions** - For non-square sprites, mention "wide" or "tall" to guide aspect ratio
6. **Avoid complexity** - Don't request shadows, gradients, or detailed textures (keep it flat)

### Multi-Frame Consistency

For animation frames (running, ducking, wing flapping), use this approach:

1. **Generate first frame** with detailed prompt
2. **For subsequent frames**, use the same prompt but add "variation" or "different pose":
   - "same character, legs in different position"
   - "identical to previous, but wings down instead of up"
   - "exact same style, ducking pose instead of standing"

## Sprite-Specific Prompts

### T-Rex Character (7 sprites needed)

#### 1. Standing T-Rex (`trex_standing.png`)
```
Cute pixelated T-Rex dinosaur standing upright, pixel art, 8-bit retro game style,
simple sprite, small arms, thick legs, centered on white background, side view,
retro chrome dinosaur game style, clean black outlines, minimal details
```

**Expected output:** T-Rex standing on two legs, facing right, simple pixel art style

#### 2. Blinking T-Rex (`trex_blinking.png`)
```
Same cute pixelated T-Rex from before, identical pose and body, but with eyes closed,
pixel art, 8-bit style, centered on white background, side view, retro game sprite
```

**Important:** Only the eyes should change! Use the same prompt as standing but specify "eyes closed"

#### 3-4. Running T-Rex (`trex_running_1.png`, `trex_running_2.png`)
```
# Frame 1:
Cute pixelated T-Rex running, left leg forward, pixel art, 8-bit retro game style,
simple sprite, side view, centered on white background, running animation frame

# Frame 2:
Same pixelated T-Rex running, right leg forward, identical style and character,
pixel art, 8-bit retro game style, side view, centered on white background
```

**Important:** Generate both frames with consistent style, only leg positions differ

#### 5. Crashed T-Rex (`trex_crashed.png`)
```
Cute pixelated T-Rex lying dead on ground, pixel art, 8-bit retro game style,
game over pose, fallen over, simple sprite, centered on white background, side view,
retro chrome dinosaur game
```

#### 6-7. Ducking T-Rex (`trex_ducking_1.png`, `trex_ducking_2.png`)
```
# Frame 1:
Cute pixelated T-Rex ducking low to ground, crouched position, pixel art,
8-bit retro game style, head lowered, wide horizontal sprite, centered on white background

# Frame 2:
Same pixelated T-Rex ducking, slightly different leg position, identical style,
pixel art, 8-bit style, crouched low, centered on white background
```

**Important:** Ducking sprites are wider (59px final vs 44px for standing)

### Pterodactyl (2 sprites needed)

#### Flying Dinosaur (`pterodactyl_1.png`, `pterodactyl_2.png`)
```
# Frame 1:
Pixelated pterodactyl flying, wings spread upward, pixel art, 8-bit retro game style,
simple sprite, side view, centered on white background, prehistoric flying dinosaur

# Frame 2:
Same pixelated pterodactyl flying, wings down, identical body and style,
pixel art, 8-bit retro game style, side view, centered on white background
```

**Expected output:** Flying dinosaur with animated wing flapping

### Obstacles

#### Cacti (`cactus_small_1/2/3.png`, `cactus_large_1/2/3.png`)
```
# Small cactus variations:
Pixelated desert cactus, small size, pixel art, 8-bit retro game style,
simple obstacle sprite, centered on white background, saguaro cactus

# Large cactus variations:
Pixelated desert cactus, tall and large, pixel art, 8-bit retro game style,
simple obstacle sprite, centered on white background, saguaro cactus with arms
```

**Note:** Generate 3 different variations for each size. Vary the arm positions or number of arms.

### Background Elements

#### Cloud (`cloud.png`)
```
Pixelated fluffy cloud, simple pixel art, 8-bit retro game style, wide horizontal cloud,
centered on white background, minimal details, flat white cloud with black outline
```

**Note:** This sprite is very wide (46×14) - mention "wide horizontal" in prompt

#### Star (`star.png`)
```
Pixelated star, tiny simple star sprite, pixel art, 8-bit retro game style,
small twinkling star, centered on white background, minimal 4-pointed or 5-pointed star
```

**Note:** Very small sprite (9×9 final size)

#### Moon Phases (`moon_phase_1.png` through `moon_phase_7.png`)
```
# Phase 1 (New Moon):
Pixelated moon, very thin crescent, pixel art, 8-bit retro game style,
simple moon sprite, centered on white background

# Phase 2-3 (Waxing):
Pixelated moon, crescent getting larger, pixel art, 8-bit style,
simple moon sprite, centered on white background

# Phase 4 (Full Moon):
Pixelated full moon, completely round, pixel art, 8-bit retro game style,
simple round moon sprite, centered on white background

# Phase 5-7 (Waning):
Pixelated moon, crescent shrinking, pixel art, 8-bit style,
simple moon sprite, centered on white background
```

**Note:** Generate 7 phases showing moon waxing from new to full and waning back

### UI Elements

#### Restart Button (`restart.png`)
```
Pixelated restart button icon, circular arrow or play again symbol, pixel art,
8-bit retro game style, simple UI element, centered on white background, game restart icon
```

#### Horizon/Ground (`horizon.png`)
```
Pixelated ground texture, desert sand or dirt, pixel art, 8-bit retro game style,
horizontal repeating pattern, very wide and short, textured ground line, centered on white background
```

**Note:** This is extremely wide (1200×12) - the AI will generate a square image, but mention "very wide horizontal texture, repeating pattern" to get a suitable pattern that can tile

#### Numbers and Text (`numbers.png`)
```
Pixelated numbers 0-9 and letters H and I, retro game font, pixel art, 8-bit style,
all characters in a row, simple blocky font, centered on white background,
plus the text "GAME OVER" below the numbers
```

**Note:** This is complex - might need to generate separately or use actual pixel font. The sprite is 191×13 containing all digits, letters, and "GAME OVER" text.

## Workflow Tips

### 1. Generate in Batches by Type

Group similar sprites together:
- All T-Rex poses in one session (maintain style consistency)
- All cacti variations together
- All moon phases together

### 2. Save Raw AI Output

Save the AI-generated images exactly as they are (512×512, 1024×1024, etc.) with the background. The processing pipeline handles:
- Background removal
- Cropping to content
- Resizing to exact dimensions

### 3. Iteration Strategy

If the first generation isn't perfect:
- **Too detailed?** Add "simple", "minimal", "flat colors" to prompt
- **Wrong style?** Emphasize "pixel art", "8-bit", "retro game sprite"
- **Bad aspect ratio?** Add "wide horizontal sprite" or "tall vertical sprite"
- **Too much background noise?** Add "solid white background", "clean background"

### 4. Testing Individual Sprites

You can test individual sprites without generating all of them:

```bash
# Process just the T-Rex sprites
python process_ai_sprites.py --sprites trex

# Process just obstacles
python process_ai_sprites.py --sprites cactus_small cactus_large pterodactyl
```

### 5. Visual Consistency Checklist

For animation frames that play together, ensure:
- ✓ Same character size
- ✓ Same color palette
- ✓ Same level of detail
- ✓ Same outline thickness
- ✓ Only the animated part changes (legs, wings, eyes, etc.)

## Example Prompt Variations

### For Different Art Styles

**Retro Chrome Style:**
```
... pixel art, chrome dinosaur game style, black and white, simple retro browser game sprite ...
```

**Colorful Modern Pixel Art:**
```
... pixel art, vibrant colors, modern indie game style, detailed pixel sprite ...
```

**Minimalist:**
```
... pixel art, ultra minimal, monochrome, simple geometric shapes ...
```

**Fantasy/Themed:**
```
... pixel art, robot dinosaur, sci-fi style, neon colors, futuristic retro game ...
... pixel art, zombie dinosaur, halloween theme, dark colors, spooky retro game ...
... pixel art, unicorn instead of dinosaur, rainbow colors, cute retro game ...
```

## Common Issues and Solutions

### Issue: AI adds too much detail
**Solution:** Add "simple", "minimal details", "flat colors", "no gradients", "no shadows"

### Issue: Background isn't solid
**Solution:** Add "solid white background", "plain background", "centered on pure white"

### Issue: Sprite too small in image
**Solution:** Add "large sprite", "sprite fills most of image", "zoomed in"

### Issue: Animation frames don't match
**Solution:** Use identical base prompt, only change the pose description, generate in same session

### Issue: Wrong proportions
**Solution:** Mention aspect ratio: "wide horizontal sprite" or "tall vertical sprite"

## Advanced: Batch Generation Script

If you're using an AI API (like Gemini API), you could automate generation:

```python
# Pseudocode for batch generation
prompts = load_prompts_from_file('sprite_prompts.json')

for sprite_name, prompt in prompts.items():
    image = gemini.generate_image(prompt)
    image.save(f'ai_generated/{sprite_name}.png')
```

## Next Steps

1. **Generate sprites** using AI with these prompts
2. **Save to `ai_generated/`** with correct filenames
3. **Process**: `python process_ai_sprites.py`
4. **Pack**: `python pack_sprites.py --input processed_sprites/ --output output/`
5. **Test**: Copy to `assets/` and open `index.html`

Happy sprite generating! 🎨🦖
