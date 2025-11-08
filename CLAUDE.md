# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the T-Rex runner game extracted from Chrome's offline error page. It's a pure client-side JavaScript game that runs in the browser with no build process or dependencies.

**Source**: Extracted from [Chromium source code](https://cs.chromium.org/chromium/src/components/neterror/resources/offline.js?q=t-rex+package:%5Echromium$&dr=C&l=7)

**Live Demo**: http://wayou.github.io/t-rex-runner/

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

- `index.html` - Main HTML file, includes embedded base64-encoded audio (30KB)
- `index.js` - Complete game logic (2753 lines, single file, 90KB)
- `index.css` - Styling for the game
- `assets/` - Sprite sheets and images for different pixel densities
  - `default_100_percent/100-offline-sprite.png` - Standard DPI sprite sheet (2.6KB)
  - `default_200_percent/200-offline-sprite.png` - HiDPI/Retina sprite sheet (3.2KB)

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

## Architecture

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
