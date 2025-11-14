# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the T-Rex runner game extracted from Chrome's offline error page. It's a pure client-side JavaScript game that runs in the browser with no build process or dependencies.

**Source**: Extracted from [Chromium source code](https://cs.chromium.org/chromium/src/components/neterror/resources/offline.js?q=t-rex+package:%5Echromium$&dr=C&l=7)

**Live Demo**: http://wayou.github.io/t-rex-runner/

## Current Development Status (November 2025)

**Active Work**: AI Sprite Generation Pipeline

Recent commits:
- `c7f161a` - Debugging sprite offset alignment in packed sprite sheets
- `99ef8cd` - Initial AI sprite generation experiment with automated processing

**What's Being Worked On**:
1. **Automated sprite replacement system** using AI-generated images
2. **Processing pipeline** (`process_ai_sprites.py`) for background removal, auto-cropping, and resizing
3. **Sprite packing** (`pack_sprites.py`) to generate game-ready sprite sheets
4. **Validation** of collision boxes and sprite positioning with custom themes

See [README_AI_SPRITES.md](README_AI_SPRITES.md) for full pipeline documentation and [ARCHITECTURE.md](ARCHITECTURE.md) for comprehensive technical architecture.

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete technical architecture, rendering pipeline, physics, collision detection, and sprite system
- **[README_AI_SPRITES.md](README_AI_SPRITES.md)** - AI sprite generation pipeline guide
- **[AI_PROMPTS.md](AI_PROMPTS.md)** - Prompting guide for generating sprites with AI
- **[SPRITE_PACKING_GUIDE.md](SPRITE_PACKING_GUIDE.md)** - Sprite sheet packing reference
- **[PIPELINE_SUMMARY.md](PIPELINE_SUMMARY.md)** - Pipeline implementation details

## Development

This is a static HTML/CSS/JavaScript project with no build step required.

### Running the Game

**Method 1: Direct File Open**
```bash
open index.html
# Or double-click index.html in your file browser
```

**Method 2: Local Web Server** (recommended for testing)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then navigate to `http://localhost:8000`

### Game Controls

- **Space** or **Up Arrow**: Jump
- **Down Arrow**: Duck (when running) or Fast-drop (when jumping)
- **Enter**: Restart after game over
- **Click/Tap**: Jump or restart

### File Structure

**Core Game Files:**
- `index.html` - Main HTML file, includes embedded base64-encoded audio (30KB)
- `index.js` - Complete game logic (2753 lines, single file, 90KB)
- `index.css` - Styling for the game
- `bot.js` - AI bot for automated gameplay

**Sprite Assets:**
- `assets/default_100_percent/100-offline-sprite.png` - Standard DPI sprite sheet (1233×68px)
- `assets/default_200_percent/200-offline-sprite.png` - HiDPI/Retina sprite sheet (2466×136px)
- `assets/default_*_percent.backup/` - Original sprites (backed up during theme changes)

**AI Sprite Generation Pipeline:**
- `process_ai_sprites.py` - Process raw AI images (background removal, auto-crop, resize)
- `pack_sprites.py` - Pack processed sprites into game-ready sprite sheets
- `sprite_config.json` - Sprite definitions and dimensions
- `ai_generated/` - Raw AI-generated images (input directory)
- `processed_sprites/` - Processed sprites ready for packing (intermediate)
- `output/` - Generated sprite sheets (output directory)

## Sprites and Animation

### Sprite Sheet Contents

The game uses a single sprite sheet containing 10 different sprite types:

1. **TREX** - T-Rex character (6 animation frames)
   - Frame 0: Standing/Jumping
   - Frames 44, 0: Waiting/Blinking (2 frames)
   - Frames 88, 132: Running (2 frames)
   - Frame 220: Crashed
   - Frames 264, 323: Ducking (2 frames)

2. **CACTUS_SMALL** - Small cactus obstacles (3 variations based on size multiplier)
3. **CACTUS_LARGE** - Large cactus obstacles (3 variations based on size multiplier)
4. **PTERODACTYL** - Flying dinosaur (2 animation frames for wing flapping)
5. **CLOUD** - Background clouds (static)
6. **HORIZON** - Ground line (2 types: flat and bumpy)
7. **MOON** - Night mode moon (7 phases: 140, 120, 100, 60, 40, 20, 0 sprite offsets)
8. **STAR** - Night mode stars (static)
9. **TEXT_SPRITE** - "GAME OVER" text and number digits (0-9, H, I for "HI")
10. **RESTART** - Restart button icon

**Total unique sprites**: ~30 individual sprites across both LDPI and HDPI versions

### Animation Frame Rates

- **T-Rex Waiting**: 3 FPS (slow blink)
- **T-Rex Running**: 12 FPS (leg movement)
- **T-Rex Ducking**: 8 FPS
- **T-Rex Crashed**: 60 FPS (single frame)
- **T-Rex Jumping**: 60 FPS (single frame)
- **Pterodactyl**: 6 FPS (wing flapping)

## Game Varieties

The base game has **1 core gameplay mode** with 2 visual variations:

### Visual Modes

1. **Day Mode** (default)
   - Light background
   - Black sprites
   - Standard colors

2. **Night Mode** (automatic every 700 points)
   - Inverted colors (dark background, white sprites)
   - Animated moon with 7 phases
   - 2 stars moving across the sky
   - 12-second fade transition

### Obstacle Variations

**3 obstacle types** with multiple variations:

1. **CACTUS_SMALL** (35px tall)
   - Can appear in groups of 1-3 (size multiplier)
   - Minimum speed: 0 (appears from game start)
   - Gap: 120px minimum

2. **CACTUS_LARGE** (50px tall)
   - Can appear in groups of 1-3 (size multiplier)
   - Minimum speed: 0 (appears from game start)
   - Gap: 120px minimum

3. **PTERODACTYL** (40px tall, animated)
   - Appears at 3 different heights: 100px, 75px, or 50px (2 heights on mobile)
   - Only appears when speed ≥ 8.5
   - Cannot be grouped (multipleSpeed: 999)
   - Gap: 150px minimum
   - Moves slightly slower than horizon (speedOffset: 0.8)

**Maximum consecutive same obstacle**: 2 (controlled by `MAX_OBSTACLE_DUPLICATION`)

### Community Forks/Variations

The README mentions several themed forks created by the community:
- Kumamon runner (different character)
- Hello KuGou (music theme)
- T-Rex runner bot (AI-controlled)
- Corona runner (pandemic theme)
- Chrome Trip (psychedelic theme)

## Game Progression

### Speed and Difficulty

- **Starting speed**: 6 units
- **Maximum speed**: 13 units (reached after ~several thousand pixels of distance)
- **Acceleration**: 0.001 per frame
- **Speed increase** affects:
  - How fast obstacles approach
  - How wide the gaps between obstacles become
  - When pterodactyls start appearing (speed ≥ 8.5)

### Scoring

- Distance is measured in pixels traveled
- Converted to score using coefficient: 0.025
- Approximately: 1 point per 40 pixels
- Achievement sound plays every 100 points
- Score flashes 3 times on achievement milestones
- Night mode activates every 700 points

### Testing

No automated test suite. Manual testing involves:
1. Opening the game in a browser (test both direct file and web server)
2. Testing all controls (Space, Up, Down, Enter, Click)
3. Verifying HiDPI sprite selection on retina displays
4. Testing mobile/touch controls on actual devices
5. Checking night mode transition at 700 points
6. Verifying collision detection accuracy
7. Testing pause/resume when switching tabs

## AI Sprite Customization System

### Overview

The game now includes an **automated pipeline for creating themed variations** using AI-generated sprites. This allows creating custom themes (sci-fi, underwater, fantasy, etc.) without code changes.

### Pipeline Flow

```
1. AI Generation (Manual)
   └─> Gemini/DALL-E/Midjourney → ai_generated/
       • 27 sprite images required
       • Any size (512×512, 1024×1024, etc.)
       • Solid background color

2. Processing (Automated)
   └─> python process_ai_sprites.py
       • Detect & remove background
       • Auto-crop to sprite bounds
       • Resize to exact game dimensions
       • Combine animation frames
       → processed_sprites/

3. Packing (Automated)
   └─> python pack_sprites.py
       • Place sprites at fixed coordinates
       • Generate LDPI (1233×68) sprite sheet
       • Generate HDPI (2466×136) sprite sheet
       → output/default_*_percent/

4. Deployment (Manual)
   └─> Copy to assets/ → Refresh browser → Play!
```

### Current Status

**Working on**: Sprite offset alignment debugging
- Fine-tuning sprite positioning in packed sheets
- Validating collision box accuracy with custom sprites
- Testing themed variations (cyber theme experimented)

**Recent Issues Being Resolved**:
- T-Rex sprite offset corrections (c7f161a)
- Ground alignment validation
- Ducking/crashed sprite positioning

### Usage

```bash
# Process AI-generated sprites
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/ --preview

# Pack into sprite sheets
python pack_sprites.py --input processed_sprites/ --output output/

# Deploy to game
cp output/default_100_percent/100-offline-sprite.png assets/default_100_percent/
cp output/default_200_percent/200-offline-sprite.png assets/default_200_percent/
```

See [README_AI_SPRITES.md](README_AI_SPRITES.md) for detailed pipeline documentation and [AI_PROMPTS.md](AI_PROMPTS.md) for sprite generation prompts.

## Architecture

**For complete technical architecture, see [ARCHITECTURE.md](ARCHITECTURE.md)**

### Core Game Components

The game is implemented as a single self-executing function with several constructor functions representing game entities:

1. **Runner** (main controller, line 14)
   - Singleton pattern managing the entire game
   - Handles game state: playing, crashed, paused, inverted (night mode)
   - Manages canvas rendering, event listeners, and game loop via `requestAnimationFrame`
   - Configuration in `Runner.config` (lines 105-129)

2. **Trex** (player character, line 1527)
   - Manages T-Rex animations: WAITING, RUNNING, JUMPING, DUCKING, CRASHED
   - Physics: gravity, jump velocity, speed drop coefficient
   - Collision detection uses multiple collision boxes for precise hit detection
   - Animation frames defined in `Trex.animFrames` (lines 1621-1642)

3. **Obstacle** (line 1279)
   - Types: CACTUS_SMALL, CACTUS_LARGE, PTERODACTYL (defined at line 1468)
   - Variable height positioning (pterodactyls can appear at different altitudes)
   - Each obstacle type has specific collision boxes for accurate detection
   - Obstacles have speed offsets (pterodactyls move differently than cacti)

4. **Horizon** (background manager, line 2536)
   - Manages the scrolling ground line (`HorizonLine`)
   - Controls obstacle spawning and removal
   - Handles cloud generation and movement
   - Manages night mode activation (`NightMode` with moon phases and stars)

5. **DistanceMeter** (score display, line 1893)
   - Converts pixel distance to game score
   - Achievement animations every 100 points
   - High score persistence

### Game Loop

The main update cycle (line 531):
1. Calculate delta time since last frame
2. Update T-Rex jump physics if jumping
3. Update horizon (ground, clouds, obstacles)
4. Check for collisions using `checkForCollision` (line 1141)
5. Update distance/score
6. Handle night mode transitions (inverts colors every 700 distance units)
7. Schedule next frame with `requestAnimationFrame`

### Sprite System

Uses sprite sheets for all graphics:
- `Runner.spriteDefinition` (line 163) defines sprite positions for LDPI and HDPI
- Automatically selects appropriate sprite sheet based on `devicePixelRatio`
- All drawing operations use `drawImage` with source and destination coordinates

### Collision Detection

Two-phase collision detection (line 1141):
1. Simple outer bounding box check (`boxCompare`)
2. Detailed axis-aligned box check using multiple collision boxes per entity
3. Each game object has defined `CollisionBox` arrays for precise hit detection

### Platform Detection

- `IS_HIDPI`: Detects retina displays (line 90)
- `IS_IOS`: Detects iOS devices (line 93)
- `IS_MOBILE`: Detects mobile devices (line 96)
- `IS_TOUCH_ENABLED`: Detects touch support (line 99)

### Event System

- Keyboard: Space/Up for jump, Down for duck, Enter for restart
- Touch: Touch controller overlay for mobile devices
- Mouse: Click to jump/restart
- Window events: Handles resize, visibility change (pause on tab switch)

## Game Configuration

Key configurable values in `Runner.config` (lines 105-129):
- `SPEED`: Initial game speed (6)
- `MAX_SPEED`: Maximum speed cap (13)
- `ACCELERATION`: Speed increase rate (0.001)
- `GRAVITY`: Jump gravity (0.6)
- `INITIAL_JUMP_VELOCITY`: Jump force (12)
- `INVERT_DISTANCE`: Distance between night mode activations (700)
- `MAX_OBSTACLE_LENGTH`: Max grouped obstacles (3)
- `GAP_COEFFICIENT`: Obstacle spacing multiplier (0.6)

## Audio

Sound effects are embedded as base64-encoded audio in the HTML:
- `offline-sound-press`: Button press/jump sound
- `offline-sound-hit`: Collision sound
- `offline-sound-reached`: Achievement sound (every 100 points)

Audio uses Web Audio API (`AudioContext`) and is disabled on iOS due to platform limitations.

## Arcade Mode

When activated (line 849), the game:
- Adds `arcade-mode` class to hide Chrome error messaging
- Scales the game container to fill the viewport
- Positions at 10% of available vertical space
- Maintains aspect ratio using CSS transforms

## Night Mode

Triggered every 700 distance units:
- Inverts page colors using CSS class toggle
- Displays animated moon with 7 phases
- Shows 2 stars that move across the sky
- Fade-in/out transition over 12 seconds

## Quick Stats Summary

| Metric | Value |
|--------|-------|
| Total Lines of Code | 2,753 (single JS file) |
| Total File Size | ~125KB (30KB HTML + 90KB JS + 3KB CSS + sprites) |
| Sprite Types | 10 unique types |
| Total Animation Frames | ~30 sprites (LDPI + HDPI) |
| Obstacle Types | 3 (Small Cactus, Large Cactus, Pterodactyl) |
| Game Modes | 2 (Day, Night) |
| T-Rex Animation States | 5 (Waiting, Running, Jumping, Ducking, Crashed) |
| Sound Effects | 3 (Jump, Hit, Achievement) |
| FPS Target | 60 |
| Starting Speed | 6 |
| Max Speed | 13 |
| Pterodactyl Unlock Speed | 8.5 |
| Night Mode Interval | Every 700 points |
| Achievement Interval | Every 100 points |
| Moon Phases | 7 |
| Max Clouds | 6 |
| Max Consecutive Same Obstacles | 2 |

## Sprite Dimensions Reference

For AI sprite generation and custom themes:

| Sprite | Dimensions | Frames | Notes |
|--------|-----------|--------|-------|
| **restart** | 36×32 | 1 | Restart button icon |
| **cloud** | 46×14 | 1 | Background cloud |
| **star** | 9×9 | 1 | Night mode star |
| **horizon** | 1200×12 | 1 | Repeating ground texture |
| **numbers** | 191×13 | 1 | Contains 0-9, H, I, "GAME OVER" |
| **trex** | 262×47 | 6 | Standing, blinking, running×2, crashed, ducking×2 |
| **pterodactyl** | 92×40 | 2 | Wing animation (46px each) |
| **cactus_small** | 51×35 | 3 | Three variations (17px each) |
| **cactus_large** | 75×50 | 3 | Three variations (25px each) |
| **moon** | 160×40 | 7 | Seven phases (~20px each) |

**Sprite Sheet Layout** (LDPI 1233×68):
```
┌─────┬──────┬───────┬───┬────────┬──────┬──────┬───────┬──────────────┐
│REST │CLOUD │PTERO  │...│CACTUS  │MOON  │STAR  │TEXT   │    TREX      │
│ART  │      │       │   │        │      │      │       │              │
└─────┴──────┴───────┴───┴────────┴──────┴──────┴───────┴──────────────┘
  2     86     134         228-332   484    645    655         848-1110
```

## Development Workflow for Sprite Changes

When working with sprite modifications:

1. **Backup original sprites** before making changes
   ```bash
   cp -r assets/default_100_percent assets/default_100_percent.backup
   cp -r assets/default_200_percent assets/default_200_percent.backup
   ```

2. **Validate sprite alignment** after packing
   - Check T-Rex ground positioning (groundYPos calculation)
   - Verify collision boxes match sprite bounds
   - Test all animation states (standing, running, ducking, jumping, crashed)
   - Verify obstacle collision detection accuracy

3. **Debug sprite issues** using debug images
   - Script generates debug_*.png files showing sprite placement
   - Compare original vs. new sprite positioning
   - Validate transparent areas and sprite bounds

4. **Test in-game** before committing
   - Run through full game cycle
   - Test all obstacle types at various speeds
   - Verify night mode transitions
   - Check score display and UI elements

## Key Line References

For quick navigation in `index.js`:

| Line | Component/Function |
|------|-------------------|
| 14 | `Runner` constructor |
| 90-99 | Platform detection (HIDPI, iOS, mobile) |
| 105-129 | `Runner.config` - Game configuration |
| 163-188 | `Runner.spriteDefinition` - Sprite coordinates |
| 531-611 | `update()` - Main game loop |
| 1141-1237 | `checkForCollision()` - Collision detection |
| 1279-1517 | `Obstacle` constructor and types |
| 1468-1517 | `Obstacle.types` - Obstacle definitions |
| 1527-1889 | `Trex` constructor and methods |
| 1621-1642 | `Trex.animFrames` - Animation definitions |
| 1788-1855 | Jump physics (`startJump`, `updateJump`) |
| 1893-2142 | `DistanceMeter` - Score display |
| 2246-2370 | `NightMode` - Night mode effects |
| 2536-2744 | `Horizon` - Background manager |
