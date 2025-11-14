# T-Rex Runner Architecture Documentation

**Comprehensive technical architecture of the Chrome T-Rex offline game**

Version: Based on Chromium source extraction
Last Updated: November 2025

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Architecture](#core-architecture)
3. [Sprite System](#sprite-system)
4. [Game Loop](#game-loop)
5. [Game Objects](#game-objects)
6. [Physics & Collision](#physics--collision)
7. [Animation System](#animation-system)
8. [Rendering Pipeline](#rendering-pipeline)
9. [Event System](#event-system)
10. [State Management](#state-management)
11. [AI Sprite Pipeline](#ai-sprite-pipeline)
12. [Performance Characteristics](#performance-characteristics)

---

## System Overview

### Technology Stack

- **Language**: Pure vanilla JavaScript (ES5)
- **Graphics**: HTML5 Canvas 2D Context
- **Audio**: Web Audio API (base64-encoded MP3)
- **Dependencies**: None (zero external libraries)
- **Build System**: None (runs directly in browser)

### File Structure

```
t-rex-runner/
├── index.html              # Entry point, sprite sheet loading
├── index.js                # Main game logic (2,753 lines)
├── index.css               # Game styling and arcade mode
├── bot.js                  # AI bot for automated gameplay
│
├── assets/
│   ├── default_100_percent/
│   │   └── 100-offline-sprite.png    # LDPI sprite sheet (1233×68)
│   └── default_200_percent/
│       └── 200-offline-sprite.png    # HDPI sprite sheet (2466×136)
│
├── AI sprite generation pipeline/
│   ├── process_ai_sprites.py         # Process raw AI images
│   ├── pack_sprites.py               # Pack into sprite sheets
│   ├── sprite_config.json            # Sprite definitions
│   └── [See AI Sprite Pipeline section]
│
└── Documentation/
    ├── ARCHITECTURE.md               # This file
    ├── CLAUDE.md                     # Developer guide
    ├── README_AI_SPRITES.md          # AI sprite pipeline
    └── AI_PROMPTS.md                 # AI generation guide
```

---

## Core Architecture

### Design Patterns

#### 1. Singleton Pattern - Runner
```javascript
function Runner(outerContainerId, opt_config) {
    // Only one game instance exists
    if (Runner.instance_) {
        return Runner.instance_;
    }
    Runner.instance_ = this;
    // ...
}
```

**Rationale**: Ensures single game instance, prevents conflicts, simplifies state management.

#### 2. Constructor Functions as Classes
```javascript
function Trex(canvas, spritePos) { /* ... */ }
Trex.prototype = { /* methods */ };

function Obstacle(canvasCtx, type, spriteImgPos, dimensions) { /* ... */ }
Obstacle.prototype = { /* methods */ };
```

**Rationale**: Pre-ES6 class pattern, provides inheritance and encapsulation.

#### 3. Configuration Objects
```javascript
Runner.config = {
    ACCELERATION: 0.001,
    MAX_SPEED: 13,
    GRAVITY: 0.6,
    // ... centralized configuration
};
```

**Rationale**: Centralizes game parameters, enables easy tuning.

#### 4. Shared Canvas Context
```javascript
// All objects receive same canvas context
this.horizon = new Horizon(this.canvas, this.spriteDef, ...);
this.tRex = new Trex(this.canvas, this.spriteDef.TREX);
```

**Rationale**: Single rendering target, layered drawing, efficient.

### Bootstrap Sequence

```
Page Load
    ↓
DOMContentLoaded event
    ↓
new Runner('.interstitial-wrapper')
    ↓
loadImages() - Select HDPI/LDPI sprite sheet
    ↓
[Wait for sprite sheet load]
    ↓
init()
    ├─ Create canvas
    ├─ new Horizon() - Ground, clouds, obstacles
    ├─ new DistanceMeter() - Score display
    ├─ new Trex() - Player character
    ├─ createTouchController() - Mobile controls
    └─ startListening() - Event handlers
    ↓
update() - Start game loop
    ↓
requestAnimationFrame loop begins
```

---

## Sprite System

### Sprite Sheet Architecture

**Single sprite sheet approach** with automatic DPI selection:

```javascript
// DPI Detection (index.js:90-98)
var IS_HIDPI = window.devicePixelRatio > 1;
var IS_MOBILE = /Android/.test(window.navigator.userAgent) || IS_IOS;

// Sprite Sheet Selection (index.js:291-307)
if (IS_HIDPI) {
    Runner.imageSprite = document.getElementById('offline-resources-2x');
    this.spriteDef = Runner.spriteDefinition.HDPI;
} else {
    Runner.imageSprite = document.getElementById('offline-resources-1x');
    this.spriteDef = Runner.spriteDefinition.LDPI;
}
```

### Sprite Definition System

**Central coordinate map** defining exact positions for all sprites:

```javascript
// index.js:163-188
Runner.spriteDefinition = {
    LDPI: {
        TREX: { x: 848, y: 2 },
        CACTUS_LARGE: { x: 332, y: 2 },
        CACTUS_SMALL: { x: 228, y: 2 },
        PTERODACTYL: { x: 134, y: 2 },
        CLOUD: { x: 86, y: 2 },
        HORIZON: { x: 2, y: 54 },
        MOON: { x: 484, y: 2 },
        STAR: { x: 645, y: 2 },
        TEXT_SPRITE: { x: 655, y: 2 },  // Numbers, "GAME OVER", "HI"
        RESTART: { x: 2, y: 2 }
    },
    HDPI: {
        // 2x coordinates for retina displays
        TREX: { x: 1678, y: 2 },
        // ... (all coordinates × 2)
    }
};
```

### Sprite Sheet Layout

**LDPI (1233×68 pixels):**
```
┌─────────────────────────────────────────────────────────────────┐
│ REST│CLOUD│PTERO│...│CACTUS│...│MOON│STAR│TEXT│......TREX.......│ (68px)
│ ART │     │     │   │      │   │    │    │    │                 │
└─────────────────────────────────────────────────────────────────┘
0    36   86   134      228   332   484  645 655              1233
```

**10 sprite types, ~30 individual sprites across both DPI versions**

### Universal Rendering Pattern

All game objects use the same `drawImage()` pattern:

```javascript
// Core pattern used by Trex, Obstacle, Cloud, NightMode, DistanceMeter
draw: function(x, y) {
    var sourceX = x;          // Frame offset within sprite
    var sourceY = y;
    var sourceWidth = this.config.WIDTH;
    var sourceHeight = this.config.HEIGHT;

    // CRITICAL: Double dimensions for HIDPI
    if (IS_HIDPI) {
        sourceX *= 2;
        sourceY *= 2;
        sourceWidth *= 2;
        sourceHeight *= 2;
    }

    // Add sprite sheet base position
    sourceX += this.spritePos.x;
    sourceY += this.spritePos.y;

    // Extract from sprite sheet → draw to canvas
    this.canvasCtx.drawImage(
        Runner.imageSprite,              // Source: sprite sheet
        sourceX, sourceY,                // Source position
        sourceWidth, sourceHeight,       // Source dimensions
        this.xPos, this.yPos,           // Target position
        this.config.WIDTH,              // Target width
        this.config.HEIGHT              // Target height
    );
}
```

**Key insight**: Frame offset `x` is added BEFORE sprite base position, allowing animations to work by changing offset values.

---

## Game Loop

### Update Cycle Architecture

**60 FPS target** using `requestAnimationFrame`:

```javascript
// index.js:531-611
update: function() {
    this.updatePending = false;

    // 1. TIMING - Calculate delta time
    var now = getTimeStamp();
    var deltaTime = now - (this.time || now);
    this.time = now;

    if (this.playing) {
        // 2. CLEAR - Blank canvas
        this.clearCanvas();

        // 3. PHYSICS - Update T-Rex jump
        if (this.tRex.jumping) {
            this.tRex.updateJump(deltaTime);
        }

        this.runningTime += deltaTime;
        var hasObstacles = this.runningTime > this.config.CLEAR_TIME;

        // 4. WORLD UPDATE - Scroll horizon
        if (this.playingIntro) {
            this.horizon.update(0, this.currentSpeed, hasObstacles);
        } else {
            deltaTime = !this.activated ? 0 : deltaTime;
            this.horizon.update(deltaTime, this.currentSpeed,
                               hasObstacles, this.inverted);
        }

        // 5. COLLISION DETECTION
        var collision = hasObstacles &&
                       checkForCollision(this.horizon.obstacles[0], this.tRex);

        if (!collision) {
            // 6. PROGRESSION - Increase distance and speed
            this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;

            if (this.currentSpeed < this.config.MAX_SPEED) {
                this.currentSpeed += this.config.ACCELERATION;  // +0.001/frame
            }
        } else {
            this.gameOver();
        }

        // 7. SCORE UPDATE
        var playAchievementSound = this.distanceMeter.update(
            deltaTime, Math.ceil(this.distanceRan)
        );

        if (playAchievementSound) {
            this.playSound(this.soundFx.SCORE);
        }

        // 8. NIGHT MODE - Toggle every 700 points
        if (this.invertTimer > this.config.INVERT_FADE_DURATION) {
            this.invertTimer = 0;
            this.invertTrigger = false;
            this.invert();
        } else if (this.invertTimer) {
            this.invertTimer += deltaTime;
        } else {
            var actualDistance =
                this.distanceMeter.getActualDistance(Math.ceil(this.distanceRan));

            if (actualDistance > 0) {
                this.invertTrigger = !(actualDistance %
                                      this.config.INVERT_DISTANCE);

                if (this.invertTrigger && this.invertTimer === 0) {
                    this.invertTimer += deltaTime;
                    this.invert();
                }
            }
        }
    }

    // 9. CHARACTER ANIMATION
    if (this.playing || (!this.activated &&
        this.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)) {
        this.tRex.update(deltaTime);

        // 10. SCHEDULE NEXT FRAME
        this.scheduleNextUpdate();
    }
}

scheduleNextUpdate: function() {
    if (!this.updatePending) {
        this.updatePending = true;
        this.raqId = requestAnimationFrame(this.update.bind(this));
    }
}
```

### Performance Optimization

- **Delta time based**: Consistent speed regardless of frame rate
- **Single RAF request**: Prevents duplicate animation frames
- **Conditional updates**: Only update active elements
- **Canvas clearing**: Full clear vs. partial updates

---

## Game Objects

### 1. Runner (Main Controller)

**Location**: index.js:14-849
**Purpose**: Orchestrates entire game

**Key Responsibilities**:
- Canvas management
- Game loop coordination
- State management (playing, crashed, paused, inverted)
- Input handling
- Audio playback
- Screen resizing

**Important Properties**:
```javascript
{
    canvas: HTMLCanvasElement,
    canvasCtx: CanvasRenderingContext2D,
    tRex: Trex,
    horizon: Horizon,
    distanceMeter: DistanceMeter,
    currentSpeed: number,          // Current game speed
    distanceRan: number,           // Total distance in pixels
    playing: boolean,
    crashed: boolean,
    inverted: boolean              // Night mode active
}
```

### 2. Trex (Player Character)

**Location**: index.js:1527-1889
**Purpose**: Player-controlled dinosaur

**Animation States**:
```javascript
// index.js:1621-1642
Trex.animFrames = {
    WAITING: {
        frames: [44, 0],           // X-offsets in sprite
        msPerFrame: 1000 / 3       // 3 FPS (slow blink)
    },
    RUNNING: {
        frames: [88, 132],         // Two leg positions
        msPerFrame: 1000 / 12      // 12 FPS
    },
    JUMPING: {
        frames: [0],               // Single frame
        msPerFrame: 1000 / 60      // 60 FPS
    },
    DUCKING: {
        frames: [264, 323],        // Two duck positions
        msPerFrame: 1000 / 8       // 8 FPS
    },
    CRASHED: {
        frames: [220],             // Eyes X_X
        msPerFrame: 1000 / 60
    }
};
```

**Sprite Layout** (262×47 total):
```
┌────┬────┬────┬────┬──────┬──────┬──────┐
│ 0  │ 44 │ 88 │132 │ 220  │ 264  │ 323  │
│JUMP│BLNK│RUN1│RUN2│CRASH │DUCK1 │DUCK2 │
│44px│44px│44px│44px│ 44px │ 59px │ 59px │
└────┴────┴────┴────┴──────┴──────┴──────┘
```

**Physics Configuration**:
```javascript
// index.js:1562-1576
Trex.config = {
    GRAVITY: 0.6,                    // Downward acceleration
    INIITAL_JUMP_VELOCITY: -10,      // Upward velocity on jump
    DROP_VELOCITY: -5,               // Fast drop (down key)
    MIN_JUMP_HEIGHT: 30,
    MAX_JUMP_HEIGHT: 30,
    SPEED_DROP_COEFFICIENT: 3,
    HEIGHT: 47,
    HEIGHT_DUCK: 25,
    WIDTH: 44,
    WIDTH_DUCK: 59
};
```

### 3. Obstacle

**Location**: index.js:1279-1517
**Purpose**: Moving hazards to avoid

**Obstacle Types**:
```javascript
// index.js:1468-1517
Obstacle.types = [
    {
        type: 'CACTUS_SMALL',
        width: 17,
        height: 35,
        yPos: 105,                   // Fixed Y position
        multipleSpeed: 4,            // Can group at speed 4+
        minGap: 120,
        minSpeed: 0,                 // Appears from start
        collisionBoxes: [...]        // 3 collision boxes
    },
    {
        type: 'CACTUS_LARGE',
        width: 25,
        height: 50,
        yPos: 90,
        multipleSpeed: 7,
        minGap: 120,
        minSpeed: 0,
        collisionBoxes: [...]        // 3 collision boxes
    },
    {
        type: 'PTERODACTYL',
        width: 46,
        height: 40,
        yPos: [100, 75, 50],         // Variable heights!
        yPosMobile: [100, 50],
        multipleSpeed: 999,          // Never groups
        minSpeed: 8.5,               // Only at higher speeds
        minGap: 150,
        numFrames: 2,                // Animated
        frameRate: 1000 / 6,         // 6 FPS wing flap
        speedOffset: .8,             // Moves slower than horizon
        collisionBoxes: [...]        // 5 collision boxes
    }
];
```

**Obstacle Creation Logic** (index.js:2678-2700):
```javascript
addNewObstacle: function(currentSpeed) {
    // Random selection
    var obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1);
    var obstacleType = Obstacle.types[obstacleTypeIndex];

    // Duplicate prevention (max 2 same in a row)
    if (this.duplicateObstacleCheck(obstacleType.type) ||
        currentSpeed < obstacleType.minSpeed) {
        this.addNewObstacle(currentSpeed);  // Recursively try again
    } else {
        var obstacleSpritePos = this.spritePos[obstacleType.type];

        this.obstacles.push(new Obstacle(
            this.canvasCtx, obstacleType, obstacleSpritePos,
            this.dimensions, this.gapCoefficient, currentSpeed,
            obstacleType.width
        ));

        this.obstacleHistory.unshift(obstacleType.type);
    }
}
```

### 4. Horizon (Background Manager)

**Location**: index.js:2536-2744
**Purpose**: Manages ground, clouds, obstacles, night mode

**Responsibilities**:
- Scrolling horizon line
- Cloud generation and movement
- Obstacle spawning and lifecycle
- Night mode coordination

**Update Cycle**:
```javascript
// index.js:2591-2600
update: function(deltaTime, currentSpeed, updateObstacles, showNightMode) {
    this.runningTime += deltaTime;
    this.horizonLine.update(deltaTime, currentSpeed);
    this.nightMode.update(showNightMode);
    this.updateClouds(deltaTime, currentSpeed);

    if (updateObstacles) {
        this.updateObstacles(deltaTime, currentSpeed);
    }
}
```

### 5. DistanceMeter (Score Display)

**Location**: index.js:1893-2142
**Purpose**: Displays current score and high score

**Number Sprite System**:
```javascript
// Uses TEXT_SPRITE area of sprite sheet
// Contains: 0-9, H, I, "GAME OVER" text

// Drawing a digit (index.js:1993-2031)
draw: function(digitPos, value, opt_highScore) {
    var sourceX = DistanceMeter.dimensions.WIDTH * value;  // Digit offset
    sourceX += this.spritePos.x;  // Add TEXT_SPRITE base position

    this.canvasCtx.drawImage(this.image,
        sourceX, sourceY,
        sourceWidth, sourceHeight,
        targetX, targetY,
        targetWidth, targetHeight
    );
}
```

**Score Calculation**:
```javascript
// index.js:1949
COEFFICIENT: 0.025  // ~1 point per 40 pixels

getActualDistance: function(distance) {
    return distance ? Math.round(distance * this.config.COEFFICIENT) : 0;
}
```

**Achievement Animation**:
- Flash 3 times at 100-point intervals
- Play sound effect
- Flash duration: 250ms on, 250ms off

### 6. NightMode

**Location**: index.js:2246-2370
**Purpose**: Night mode visual effects

**Moon Phase System**:
```javascript
// index.js:2274
NightMode.phases = [140, 120, 100, 60, 40, 20, 0];  // X-offsets

// Cycles through 7 moon phases
update: function(activated, delta) {
    if (activated && this.opacity == 0) {
        this.currentPhase++;
        if (this.currentPhase >= NightMode.phases.length) {
            this.currentPhase = 0;
        }
    }

    // 12-second fade in/out
    if (activated && this.opacity < 1) {
        this.opacity += NightMode.config.FADE_SPEED;  // 0.035
    } else if (this.opacity > 0) {
        this.opacity -= NightMode.config.FADE_SPEED;
    }
}
```

**Star System**:
- 2 stars per cycle
- Random X positions
- Move at 0.3 speed
- Max Y: 70px

---

## Physics & Collision

### Jump Physics

**Parabolic trajectory** using gravity and velocity:

```javascript
// index.js:1788-1796
startJump: function(speed) {
    // Velocity adjusted for game speed (faster = lower jump)
    this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY - (speed / 10);
    this.jumping = true;
    this.reachedMinHeight = false;
    this.speedDrop = false;
}

// index.js:1803-1855
updateJump: function(deltaTime) {
    var msPerFrame = this.msPerFrame;
    var framesElapsed = deltaTime / msPerFrame;

    if (this.jumping) {
        // Update position (velocity * time)
        this.yPos += Math.round(this.jumpVelocity * framesElapsed);

        // Apply gravity (acceleration * time)
        this.jumpVelocity += this.config.GRAVITY * framesElapsed;

        // Check minimum height (for variable jump)
        if (this.yPos < this.minJumpHeight || this.speedDrop) {
            this.reachedMinHeight = true;
        }

        // Check if landed
        if (this.yPos >= this.groundYPos) {
            this.reset();
            this.jumpCount++;
        }
    }
}
```

**Speed Drop Mechanic**:
```javascript
// Pressing down while jumping accelerates descent
setSpeedDrop: function() {
    this.speedDrop = true;
    this.jumpVelocity = this.config.DROP_VELOCITY;  // -5 (faster than gravity)
}
```

### Collision Detection

**Two-phase system** for performance and accuracy:

```javascript
// index.js:1141-1237
function checkForCollision(obstacle, tRex) {
    // PHASE 1: Simple outer bounding box check (fast)
    var tRexBox = new CollisionBox(
        tRex.xPos + 1,
        tRex.yPos + 1,
        tRex.config.WIDTH - 2,
        tRex.config.HEIGHT - 2
    );

    var obstacleBox = new CollisionBox(
        obstacle.xPos + 1,
        obstacle.yPos + 1,
        obstacle.typeConfig.width * obstacle.size - 2,
        obstacle.typeConfig.height - 2
    );

    if (boxCompare(tRexBox, obstacleBox)) {
        // PHASE 2: Detailed collision boxes (accurate)
        var collisionBoxes = obstacle.collisionBoxes;
        var tRexCollisionBoxes = tRex.ducking ?
            Trex.collisionBoxes.DUCKING :
            Trex.collisionBoxes.RUNNING;

        // Check all box pairs
        for (var t = 0; t < tRexCollisionBoxes.length; t++) {
            for (var i = 0; i < collisionBoxes.length; i++) {
                // Adjust positions relative to object
                var adjTrexBox = createAdjustedCollisionBox(
                    tRexCollisionBoxes[t], tRexBox
                );
                var adjObstacleBox = createAdjustedCollisionBox(
                    collisionBoxes[i], obstacleBox
                );

                if (boxCompare(adjTrexBox, adjObstacleBox)) {
                    return [adjTrexBox, adjObstacleBox];  // COLLISION!
                }
            }
        }
    }

    return false;
}

// Axis-Aligned Bounding Box (AABB) collision
function boxCompare(box1, box2) {
    return box1.x < box2.x + box2.width &&
           box1.x + box1.width > box2.x &&
           box1.y < box2.y + box2.height &&
           box1.height + box1.y > box2.y;
}
```

**T-Rex Collision Boxes**:
```javascript
// index.js:1583-1595
Trex.collisionBoxes = {
    DUCKING: [
        new CollisionBox(1, 18, 55, 25)  // Single large box
    ],
    RUNNING: [
        new CollisionBox(22, 0, 17, 16),  // Head
        new CollisionBox(1, 18, 30, 9),   // Body upper
        new CollisionBox(10, 35, 14, 8),  // Legs
        new CollisionBox(1, 24, 29, 5),   // Body mid
        new CollisionBox(5, 30, 21, 4),   // Body lower
        new CollisionBox(9, 34, 15, 4)    // Feet
    ]
};
```

**Visual representation** (RUNNING):
```
     [HEAD]
    ╔══════╗
    ║ [22] ║  ← Head hitbox (22, 0, 17×16)
    ╚══════╝
  ╔═══════════╗
  ║  [BODY]   ║  ← Body boxes (multiple)
  ║           ║
  ╚═══════════╝
    ║║  ║║
    [LEGS]      ← Leg boxes
```

---

## Animation System

### Frame-Based Animation

All animations use **time-based frame cycling**:

```javascript
// Universal animation update pattern
update: function(deltaTime, opt_status) {
    this.timer += deltaTime;

    // Switch animation state
    if (opt_status) {
        this.status = opt_status;
        this.currentFrame = 0;
        this.msPerFrame = AnimFrames[opt_status].msPerFrame;
        this.currentAnimFrames = AnimFrames[opt_status].frames;
    }

    // Draw current frame (frames are X-offsets in sprite)
    this.draw(this.currentAnimFrames[this.currentFrame], 0);

    // Advance frame when timer exceeds threshold
    if (this.timer >= this.msPerFrame) {
        this.currentFrame = (this.currentFrame == this.currentAnimFrames.length - 1)
                           ? 0 : this.currentFrame + 1;
        this.timer = 0;
    }
}
```

### Animation Frame Rates

| Object | State | FPS | Purpose |
|--------|-------|-----|---------|
| **T-Rex** | WAITING | 3 | Slow blink |
| | RUNNING | 12 | Leg movement |
| | DUCKING | 8 | Duck animation |
| | JUMPING | 60 | Static frame |
| | CRASHED | 60 | Static frame |
| **Pterodactyl** | Flying | 6 | Wing flapping |
| **Moon** | - | Manual | Phase changes every 700 points |

### Blink Mechanism

**Random idle blink** in waiting state:

```javascript
// index.js:1761-1782
setBlinkDelay: function() {
    // Random delay between blinks (0-7000ms)
    this.blinkDelay = Math.ceil(Math.random() * Trex.BLINK_TIMING);
}

blink: function(time) {
    var deltaTime = time - this.animStartTime;

    if (deltaTime >= this.blinkDelay) {
        // Draw current frame (0 = eyes open, 44 = eyes closed)
        this.draw(this.currentAnimFrames[this.currentFrame], 0);

        if (this.currentFrame == 1) {
            // Set new random delay
            this.setBlinkDelay();
            this.animStartTime = time;
            this.blinkCount++;
        }
    }
}
```

---

## Rendering Pipeline

### Layer Order (Back to Front)

1. **Clear canvas** - Full screen clear
2. **Horizon line** - Ground texture (bumpy/flat)
3. **Clouds** - Background parallax
4. **Obstacles** - Cacti, pterodactyls
5. **T-Rex** - Player character
6. **Distance meter** - Score display
7. **Night mode overlay** - Moon and stars (when active)

### Canvas Scaling

**HIDPI handling** for retina displays:

```javascript
// index.js:850-878
Runner.updateCanvasScaling = function(canvas, opt_width, opt_height) {
    var context = canvas.getContext('2d');

    var devicePixelRatio = Math.floor(window.devicePixelRatio) || 1;
    var backingStoreRatio = 1;  // Always 1 for modern browsers
    var ratio = devicePixelRatio / backingStoreRatio;

    if (devicePixelRatio !== backingStoreRatio) {
        var oldWidth = opt_width || canvas.width;
        var oldHeight = opt_height || canvas.height;

        // Increase canvas pixel density
        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;

        // Scale down CSS to maintain visual size
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';

        // Scale context to match
        context.scale(ratio, ratio);
    }
};
```

### Drawing Performance

- **Single sprite sheet**: One image load, cached by browser
- **No DOM manipulation**: Pure canvas drawing
- **Minimal state changes**: Batch similar draw operations
- **RequestAnimationFrame**: Browser-optimized timing

---

## Event System

### Input Handling

**Unified event handler** for all input types:

```javascript
// index.js:616-631
handleEvent: function(e) {
    return (function(evtType, events) {
        switch (evtType) {
            case events.KEYDOWN:
            case events.TOUCHSTART:
            case events.MOUSEDOWN:
                this.onKeyDown(e);
                break;
            case events.KEYUP:
            case events.TOUCHEND:
            case events.MOUSEUP:
                this.onKeyUp(e);
                break;
        }
    }.bind(this))(e.type, Runner.events);
}
```

### Key Mappings

```javascript
// index.js:206-210
Runner.keycodes = {
    JUMP: { '38': 1, '32': 1 },    // Up arrow, Spacebar
    DUCK: { '40': 1 },              // Down arrow
    RESTART: { '13': 1 }            // Enter
};
```

### Touch Controls

**Full-screen overlay** for mobile:

```javascript
// index.js:400-404
createTouchController: function() {
    this.touchController = document.createElement('div');
    this.touchController.className = Runner.classes.TOUCH_CONTROLLER;
    this.outerContainerEl.appendChild(this.touchController);
}
```

**Tap to jump/restart**, no on-screen buttons.

---

## State Management

### Game States

```javascript
{
    activated: boolean,    // Easter egg activated
    playing: boolean,      // Game in progress
    crashed: boolean,      // Hit obstacle
    paused: boolean,       // Tab switched away
    inverted: boolean      // Night mode active
}
```

### State Transitions

```
IDLE (waiting, T-Rex blinking)
    │
    ├─[SPACE]→ INTRO ANIMATION
    │              │
    │              ├─[.4s]→ PLAYING
    │
PLAYING
    │
    ├─[Collision]→ CRASHED
    │                  │
    │                  ├─[SPACE/CLICK]→ RESTART → PLAYING
    │
    ├─[Tab switch]→ PAUSED
    │                  │
    │                  └─[Tab focus]→ PLAYING
    │
    └─[700 points]→ NIGHT MODE TOGGLE
                       │
                       └─[12s fade]→ Continue PLAYING
```

### Pause Handling

**Automatic pause** on tab switch:

```javascript
// index.js:998-1023
onVisibilityChange: function(e) {
    if (document.hidden || document.webkitHidden || e.type == 'blur' ||
        document.visibilityState != 'visible') {
        this.stop();
    } else if (!this.crashed) {
        this.tRex.reset();
        this.play();
    }
}
```

---

## AI Sprite Pipeline

### Overview

**Custom sprite replacement system** for themed variations:

```
AI Generation → Processing → Packing → Deployment
   (manual)    (automated)  (automated)   (manual)
```

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────┐
│ 1. AI GENERATION                                    │
│    Gemini/DALL-E → ai_generated/                   │
│    • Any size (512×512, 1024×1024)                 │
│    • Solid background                               │
│    • 27 sprite images required                      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. PROCESSING (process_ai_sprites.py)              │
│    • Detect & remove background                     │
│    • Auto-crop to content bounds                    │
│    • Resize to exact game dimensions                │
│    • Combine animation frames                       │
│    Output: processed_sprites/                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. PACKING (pack_sprites.py)                       │
│    • Place at fixed coordinates                     │
│    • Generate LDPI (1233×68)                       │
│    • Generate HDPI (2466×136, 2× scale)            │
│    Output: output/default_*_percent/                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. DEPLOYMENT                                       │
│    Copy to assets/ → Refresh browser → Play!        │
└─────────────────────────────────────────────────────┘
```

### Processing Algorithm

**Background Detection** (process_ai_sprites.py:38-72):
```python
def detect_background_color(image):
    # Sample edge pixels (configurable %)
    edge_pixels = sample_edges(image, edge_percent=5)

    # Use median for noise robustness
    bg_color = np.median(edge_pixels, axis=0)

    return bg_color

def remove_background(image, threshold=30):
    bg_color = detect_background_color(image)

    # Calculate color distance
    diff = np.sqrt(np.sum((rgb - bg_color) ** 2, axis=2))

    # Create alpha mask
    alpha = (diff > threshold) * 255

    return image_with_alpha
```

**Auto-Crop** (finds sprite bounds):
```python
def auto_crop(image, padding=2):
    # Find non-transparent pixels
    bbox = image.getbbox()  # (left, top, right, bottom)

    # Add padding
    bbox = (
        max(0, bbox[0] - padding),
        max(0, bbox[1] - padding),
        min(image.width, bbox[2] + padding),
        min(image.height, bbox[3] + padding)
    )

    return image.crop(bbox)
```

**Smart Resize** (maintains aspect ratio):
```python
def resize_to_target(image, target_width, target_height):
    # Check aspect ratio
    src_aspect = image.width / image.height
    tgt_aspect = target_width / target_height

    if abs(src_aspect - tgt_aspect) > 0.01:
        # Center-crop to target aspect first
        image = center_crop_to_aspect(image, tgt_aspect)

    # High-quality resize
    return image.resize((target_width, target_height), Image.LANCZOS)
```

**Frame Combination** (horizontal strips):
```python
def combine_frames(frames, widths):
    total_width = sum(widths)
    max_height = max(f.height for f in frames)

    # Create blank canvas
    canvas = Image.new('RGBA', (total_width, max_height))

    # Paste frames horizontally
    x_offset = 0
    for frame, width in zip(frames, widths):
        canvas.paste(frame, (x_offset, 0))
        x_offset += width

    return canvas
```

### Sprite Configuration

**sprite_config.json** defines all sprite specifications:

```json
{
  "sprite_definitions": {
    "trex": {
      "output_filename": "trex.png",
      "total_dimensions": {"width": 262, "height": 47},
      "frames": [
        {"name": "trex_standing", "width": 44, "height": 47},
        {"name": "trex_blinking", "width": 44, "height": 47},
        {"name": "trex_running_1", "width": 44, "height": 47},
        {"name": "trex_running_2", "width": 44, "height": 47},
        {"name": "trex_crashed", "width": 44, "height": 47},
        {"name": "trex_ducking_1", "width": 59, "height": 47},
        {"name": "trex_ducking_2", "width": 59, "height": 47}
      ]
    },
    "pterodactyl": {
      "output_filename": "pterodactyl.png",
      "total_dimensions": {"width": 92, "height": 40},
      "frames": [
        {"name": "pterodactyl_1", "width": 46, "height": 40},
        {"name": "pterodactyl_2", "width": 46, "height": 40}
      ]
    }
    // ... 10 sprite types total
  },
  "processing_config": {
    "background_detection": {
      "edge_sample_percent": 5,
      "color_threshold": 30,
      "crop_padding": 2
    }
  }
}
```

### Current Work

**Recent commits** (as of Nov 2025):
- `c7f161a`: Debugging sprite offset issues
- `99ef8cd`: AI sprite generation experiment

**Active development**:
- Fine-tuning sprite alignment in packed sheets
- Validating collision box accuracy with custom sprites
- Testing themed variations (cyber, fantasy, etc.)

### Usage

```bash
# 1. Generate sprites with AI (manual)
# See AI_PROMPTS.md for prompting guide

# 2. Process raw AI images
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/ --preview

# 3. Pack into sprite sheets
python pack_sprites.py --input processed_sprites/ --output output/

# 4. Deploy to game
cp output/default_100_percent/100-offline-sprite.png assets/default_100_percent/
cp output/default_200_percent/200-offline-sprite.png assets/default_200_percent/
```

---

## Performance Characteristics

### Metrics

- **Target FPS**: 60
- **Actual FPS**: 55-60 (varies by device)
- **Memory**: ~10-20 MB (single sprite sheet cached)
- **CPU**: ~5-10% (modern devices)

### Optimization Techniques

1. **Single sprite sheet**: Minimizes HTTP requests and texture switching
2. **Delta time based**: Consistent speed regardless of frame rate drops
3. **Object pooling**: Obstacles reused when off-screen (cleared from array)
4. **Conditional rendering**: Only draw visible elements
5. **Integer arithmetic**: `Math.floor()`, `Math.ceil()` for pixel positions
6. **RAF throttling**: Single pending frame prevents duplicate requests

### Bottlenecks

- **Canvas clearing**: Full clear every frame (could optimize with dirty rectangles)
- **Collision detection**: O(n×m) box comparisons (but n, m are small)
- **No Web Workers**: Single-threaded, physics could be offloaded

### Browser Compatibility

- **Chrome**: Native (extracted from source)
- **Firefox**: Full support
- **Safari**: Full support (iOS audio disabled)
- **Edge**: Full support
- **Mobile**: Touch controls, optimized speed

---

## Configuration Reference

### Game Parameters

```javascript
// index.js:105-129
Runner.config = {
    ACCELERATION: 0.001,           // Speed increase per frame
    BG_CLOUD_SPEED: 0.2,          // Cloud movement speed
    BOTTOM_PAD: 10,                // Ground padding
    CLEAR_TIME: 3000,              // Delay before obstacles (ms)
    CLOUD_FREQUENCY: 0.5,          // Cloud spawn chance
    GAMEOVER_CLEAR_TIME: 750,      // Restart delay after crash (ms)
    GAP_COEFFICIENT: 0.6,          // Obstacle spacing multiplier
    GRAVITY: 0.6,                  // Jump gravity
    INITIAL_JUMP_VELOCITY: 12,     // Jump force
    INVERT_FADE_DURATION: 12000,   // Night mode fade (ms)
    INVERT_DISTANCE: 700,          // Night mode interval (points)
    MAX_BLINK_COUNT: 3,            // Idle blinks before game starts
    MAX_CLOUDS: 6,                 // Maximum clouds on screen
    MAX_OBSTACLE_LENGTH: 3,        // Max grouped obstacles
    MAX_OBSTACLE_DUPLICATION: 2,   // Max same obstacle in a row
    MAX_SPEED: 13,                 // Speed cap
    MIN_JUMP_HEIGHT: 35,           // Minimum jump height
    MOBILE_SPEED_COEFFICIENT: 1.2, // Mobile speed adjustment
    SPEED: 6,                      // Starting speed
    SPEED_DROP_COEFFICIENT: 3      // Fast drop multiplier
};
```

### Tuning Guide

**Difficulty**:
- Increase `ACCELERATION` for faster progression
- Decrease `GAP_COEFFICIENT` for tighter obstacle spacing
- Decrease `MAX_OBSTACLE_DUPLICATION` for more variety

**Physics**:
- Increase `GRAVITY` for faster falls
- Increase `INITIAL_JUMP_VELOCITY` for higher jumps
- Adjust `MIN_JUMP_HEIGHT` for variable jump control

**Visual**:
- Adjust `INVERT_DISTANCE` for night mode frequency
- Modify `CLOUD_FREQUENCY` for cloud density
- Change `MAX_CLOUDS` for performance/aesthetics

---

## Code Style & Conventions

### Naming

- **PascalCase**: Constructor functions (`Trex`, `Obstacle`, `Runner`)
- **camelCase**: Methods, variables (`updateJump`, `distanceRan`)
- **SCREAMING_SNAKE_CASE**: Constants (`MAX_SPEED`, `GRAVITY`)

### Structure

- **Prototype pattern**: Methods added via `Constructor.prototype = {}`
- **Configuration objects**: `Constructor.config = {}`
- **Static properties**: `Constructor.property = value`

### Comments

- **JSDoc style**: Function descriptions
- **Inline**: Complex logic explanations
- **Section markers**: `//******************************************************************************`

---

## Extension Points

### Adding New Obstacles

1. Add to `Obstacle.types` array with config
2. Add sprite coordinates to `Runner.spriteDefinition`
3. Generate sprites and place in sprite sheet
4. Define collision boxes
5. Test spawn conditions and collision

### Custom Themes

1. Use AI sprite pipeline to generate new sprites
2. Maintain exact dimensions per `sprite_config.json`
3. Pack into sprite sheets
4. Deploy to `assets/` directories
5. No code changes required!

### Modifying Physics

1. Adjust values in `Runner.config` or `Trex.config`
2. Tune in console: `Runner.instance_.updateConfigSetting('GRAVITY', 0.8)`
3. Reload to reset

### Adding Game Modes

1. Add state flag to `Runner` constructor
2. Implement mode-specific logic in `update()`
3. Add UI toggle if needed
4. Consider separate high score tracking

---

## Glossary

- **LDPI**: Low Dots Per Inch (standard resolution, 1× scale)
- **HDPI**: High Dots Per Inch (retina resolution, 2× scale)
- **Sprite Sheet**: Single image containing all game graphics
- **Canvas Context**: 2D drawing API for HTML5 canvas
- **RequestAnimationFrame**: Browser API for smooth 60 FPS animations
- **AABB**: Axis-Aligned Bounding Box (collision detection method)
- **Delta Time**: Time elapsed since last frame (for consistent speed)
- **RAF**: RequestAnimationFrame (abbreviated)

---

## References

- **Original Source**: [Chromium offline.js](https://cs.chromium.org/chromium/src/components/neterror/resources/offline.js)
- **Live Demo**: http://wayou.github.io/t-rex-runner/
- **Repository**: https://github.com/wayou/t-rex-runner
- **AI Sprite Pipeline**: See [README_AI_SPRITES.md](README_AI_SPRITES.md)
- **AI Prompts**: See [AI_PROMPTS.md](AI_PROMPTS.md)

---

## Changelog

### November 2025
- Added AI sprite generation pipeline
- Enhanced sprite processing automation
- Debugging sprite offset alignment

### Original
- Extracted from Chromium source
- Standalone web implementation

---

**End of Architecture Documentation**

For specific implementation details, see inline code comments in `index.js`.
For AI sprite customization, see [README_AI_SPRITES.md](README_AI_SPRITES.md).
For development guide, see [CLAUDE.md](CLAUDE.md).
