/**
 * T-Rex Runner Bot
 * Automatically plays the game with speed-adaptive obstacle avoidance
 */

class TRexBot {
    constructor() {
        this.runner = null;
        this.intervalId = null;
        this.isRunning = false;
        this.stats = {
            jumps: 0,
            ducks: 0,
            deaths: 0,
            highScore: 0
        };

        // Configuration
        this.config = {
            checkInterval: 10, // Check every 10ms

            // Base reaction distances (pixels) at starting speed
            baseReactionDistance: {
                'CACTUS_SMALL': 100,
                'CACTUS_LARGE': 110,
                'PTERODACTYL': 150
            },

            // Speed scaling factor
            // Higher = more conservative (reacts earlier)
            speedScaleFactor: 1.0,

            // Pterodactyl height threshold for ducking vs jumping
            pterodactylDuckThreshold: 75,

            // Auto-restart after crash
            autoRestart: true,
            restartDelay: 500 // ms
        };
    }

    /**
     * Initialize and start the bot
     */
    start() {
        if (this.isRunning) {
            console.log('Bot is already running');
            return;
        }

        // Wait for game to be ready
        if (!window.Runner || !Runner.instance_) {
            console.log('Waiting for game to initialize...');
            setTimeout(() => this.start(), 100);
            return;
        }

        this.runner = Runner.instance_;
        this.isRunning = true;

        // Start the game if not already playing
        if (!this.runner.playing) {
            this.startGame();
        }

        // Start bot loop
        this.intervalId = setInterval(() => this.update(), this.config.checkInterval);

        console.log('🤖 Bot started!');
        console.log('Use bot.stop() to stop, bot.stats to see statistics');
    }

    /**
     * Stop the bot
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('🤖 Bot stopped');
        this.showStats();
    }

    /**
     * Start the game
     */
    startGame() {
        if (!this.runner.playing) {
            // Simulate space key press
            const evt = new KeyboardEvent('keydown', {
                keyCode: 32,
                code: 'Space',
                key: ' '
            });
            document.dispatchEvent(evt);
        }
    }

    /**
     * Main bot update loop
     */
    update() {
        if (!this.runner) return;

        // Check if crashed
        if (this.runner.crashed) {
            this.handleCrash();
            return;
        }

        // Only run when game is playing
        if (!this.runner.playing) return;

        // Get next obstacle
        const obstacle = this.getNextObstacle();

        if (obstacle) {
            this.handleObstacle(obstacle);
        } else {
            // No obstacle, stop ducking if we are
            if (this.runner.tRex.ducking) {
                this.runner.tRex.setDuck(false);
            }
        }
    }

    /**
     * Get the next obstacle that needs attention
     */
    getNextObstacle() {
        const obstacles = this.runner.horizon.obstacles;

        // Return first visible obstacle
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].isVisible() && obstacles[i].xPos > 0) {
                return obstacles[i];
            }
        }

        return null;
    }

    /**
     * Calculate reaction distance based on current speed
     */
    getReactionDistance(obstacleType) {
        const baseDistance = this.config.baseReactionDistance[obstacleType] || 100;
        const currentSpeed = this.runner.currentSpeed;
        const startSpeed = this.runner.config.SPEED; // 6

        // Scale distance proportionally to speed increase
        const speedRatio = currentSpeed / startSpeed;
        const scaledDistance = baseDistance * speedRatio * this.config.speedScaleFactor;

        return scaledDistance;
    }

    /**
     * Handle obstacle avoidance
     */
    handleObstacle(obstacle) {
        const tRex = this.runner.tRex;
        const distance = obstacle.xPos - tRex.xPos;
        const reactionDistance = this.getReactionDistance(obstacle.typeConfig.type);

        // Check if we need to react
        if (distance < reactionDistance && distance > 0) {
            const obstacleType = obstacle.typeConfig.type;

            if (obstacleType === 'PTERODACTYL') {
                // Decide: duck or jump based on pterodactyl height
                if (obstacle.yPos <= this.config.pterodactylDuckThreshold) {
                    // High pterodactyl - duck under it
                    if (!tRex.ducking) {
                        tRex.setDuck(true);
                        this.stats.ducks++;
                    }
                } else {
                    // Low pterodactyl - jump over it
                    if (!tRex.jumping && !tRex.ducking) {
                        tRex.startJump(this.runner.currentSpeed);
                        this.stats.jumps++;
                    }
                }
            } else {
                // Cactus - always jump
                if (!tRex.jumping && !tRex.ducking) {
                    tRex.startJump(this.runner.currentSpeed);
                    this.stats.jumps++;
                }
            }
        } else if (distance > reactionDistance) {
            // Obstacle is far away, stop ducking
            if (tRex.ducking) {
                tRex.setDuck(false);
            }
        }
    }

    /**
     * Handle crash event
     */
    handleCrash() {
        this.stats.deaths++;
        const currentScore = Math.ceil(this.runner.distanceRan);

        if (currentScore > this.stats.highScore) {
            this.stats.highScore = currentScore;
            console.log(`🏆 New high score: ${this.stats.highScore}`);
        }

        if (this.config.autoRestart) {
            setTimeout(() => {
                if (this.isRunning) {
                    this.runner.restart();
                }
            }, this.config.restartDelay);
        }
    }

    /**
     * Show current statistics
     */
    showStats() {
        console.log('📊 Bot Statistics:');
        console.log(`  High Score: ${this.stats.highScore}`);
        console.log(`  Jumps: ${this.stats.jumps}`);
        console.log(`  Ducks: ${this.stats.ducks}`);
        console.log(`  Deaths: ${this.stats.deaths}`);
    }

    /**
     * Adjust bot aggressiveness
     * @param {number} factor - Lower = more aggressive (reacts later), Higher = more conservative
     */
    setAggressiveness(factor) {
        this.config.speedScaleFactor = factor;
        console.log(`Aggressiveness set to ${factor} (1.0 = default, <1.0 = risky, >1.0 = safe)`);
    }
}

// Create global bot instance
const bot = new TRexBot();

// Log available commands when page loads (bot must be started manually)
window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('🎮 T-Rex Bot ready!');
        console.log('Commands:');
        console.log('  bot.start()  - Start the bot');
        console.log('  bot.stop()   - Stop the bot');
        console.log('  bot.stats    - View statistics');
        console.log('  bot.showStats() - Print statistics');
        console.log('  bot.setAggressiveness(factor) - Adjust reaction time');
    }, 500);
});
