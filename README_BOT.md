# T-Rex Runner Bot

An AI bot that automatically plays the T-Rex runner game with adaptive obstacle avoidance.

## Quick Start

### Option 1: Include in HTML (recommended)

Uncomment the bot script line in `index.html`:
```html
<script src="bot.js"></script>
```

Then open `index.html` - the bot will auto-start after 2 seconds.

### Option 2: Browser Console (testing)

1. Open `index.html` in browser
2. Open browser console (F12)
3. Paste the contents of `bot.js`
4. Type: `bot.start()`

## Usage

### Commands

```javascript
bot.start()              // Start the bot
bot.stop()               // Stop the bot
bot.stats                // View current statistics
bot.showStats()          // Print statistics to console
bot.setAggressiveness(1.5) // Adjust reaction time (default: 1.0)
```

### Configuration

```javascript
// Make bot more conservative (reacts earlier)
bot.setAggressiveness(1.5)

// Make bot more risky (reacts later, saves energy)
bot.setAggressiveness(0.8)

// Disable auto-restart
bot.config.autoRestart = false

// Adjust restart delay
bot.config.restartDelay = 1000 // 1 second
```

## How It Works

### Speed-Adaptive Algorithm

The bot uses a **dynamic reaction distance** that scales with game speed:

```
reactionDistance = baseDistance × (currentSpeed / startSpeed) × scaleFactor
```

- **At speed 6** (start): reacts ~100-150px away
- **At speed 13** (max): reacts ~200-300px away
- **Automatically scales** as the game gets faster

### Decision Logic

1. **For Cacti**: Always jump
2. **For Pterodactyls**:
   - If high (y ≤ 75px): Duck under
   - If low (y > 75px): Jump over

### Reaction Distances (at base speed)

- Small Cactus: 100px
- Large Cactus: 110px
- Pterodactyl: 150px (needs more time to decide duck/jump)

## Statistics Tracked

- **High Score**: Best score achieved
- **Jumps**: Total jumps performed
- **Ducks**: Total ducks performed
- **Deaths**: Number of crashes

View with: `bot.showStats()`

## Tuning

If the bot is dying too often:
```javascript
bot.setAggressiveness(1.3) // React earlier
```

If you want to test reaction limits:
```javascript
bot.setAggressiveness(0.7) // React later (risky!)
```

## Technical Details

- **Update frequency**: 10ms (100 times/second)
- **Obstacle detection**: Reads `runner.horizon.obstacles[0]`
- **Distance calculation**: `obstacle.xPos - tRex.xPos`
- **Speed awareness**: Scales with `runner.currentSpeed`

## Example Session

```javascript
// Start the bot
bot.start()

// Let it run for a while...
// Check stats
bot.showStats()
// Output:
// 📊 Bot Statistics:
//   High Score: 3847
//   Jumps: 245
//   Ducks: 38
//   Deaths: 12

// Make it more aggressive
bot.setAggressiveness(0.9)

// Stop when done
bot.stop()
```

## Disabling Auto-Start

Edit `bot.js` and comment out this line at the bottom:

```javascript
// setTimeout(() => bot.start(), 2000);
```

Then manually control with `bot.start()` in console.
