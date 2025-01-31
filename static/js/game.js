class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.score = 0;
        this.currentLevel = 1;
        this.levelMessageTimer = LEVEL_MESSAGE_DURATION;
        
        // Initialize game objects
        this.player = new Player();
        this.platforms = [];
        this.obstacles = [];
        this.cats = [];
        this.cheeseballs = [];
        this.lastCatSpawn = 0;
        this.lastCheeseballSpawn = 0;
        this.scrollSpeed = SCROLL_SPEED;
        
        // Load assets
        this.loadAssets().then(() => {
            this.setupEventListeners();
            this.generateInitialChunk();
            this.start();
        });
    }

    async loadAssets() {
        try {
            // Load images
            this.ryanImage = await this.loadImage('static/images/Ryan.png');
            this.dalbirdImage = await this.loadImage('static/images/dalbird.png');
            this.villainImage = await this.loadImage('static/images/villain.png');
            
            // Load audio
            this.superBassAudio = new Audio('static/audio/superbass.mp3');
            this.superBassAudio.loop = true;
            
            // Load Catlock GIF frames
            this.catlockFrames = await this.loadGifFrames('static/images/Catlock2.gif');
            
            // Hide loading screen
            this.loadingScreen.style.display = 'none';
        } catch (error) {
            console.error('Error loading assets:', error);
            this.loadingScreen.textContent = 'Error loading game assets. Please refresh.';
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                resolve(null); // Resolve with null to continue game without image
            };
            img.src = src;
        });
    }

    async loadGifFrames(src) {
        // This would normally use a GIF decoder library
        // For now, return null to indicate GIF support needs to be implemented
        console.warn('GIF support not implemented');
        return null;
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    handleKeyDown(e) {
        if (this.gameOver && e.key === 'r') {
            this.restart();
            return;
        }

        if (e.key === 'p') {
            this.togglePause();
            return;
        }

        if (!this.isPaused && !this.gameOver) {
            switch (e.key) {
                case ' ':
                    this.player.jump();
                    break;
                case 'ArrowLeft':
                    this.player.moveLeft();
                    break;
                case 'ArrowRight':
                    this.player.moveRight();
                    break;
                case 'ArrowDown':
                    this.player.squat();
                    break;
                case 'x':
                    this.player.shootLaser();
                    break;
            }
        }
    }

    handleKeyUp(e) {
        if (!this.isPaused && !this.gameOver) {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.player.stopMoving();
                    break;
                case 'ArrowDown':
                    this.player.stopSquatting();
                    break;
            }
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (!this.isPaused && !this.gameOver) {
            // Simple touch controls - jump on touch
            this.player.jump();
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
    }

    generateInitialChunk() {
        let x = WINDOW_WIDTH;
        while (x < WINDOW_WIDTH * 2) {
            const width = Math.random() * (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH) + MIN_PLATFORM_WIDTH;
            const y = Math.random() * PLATFORM_HEIGHT_VARIANCE + (GROUND_HEIGHT - PLATFORM_HEIGHT_VARIANCE);
            
            this.platforms.push(new Platform(x, y, width));
            
            // Maybe add obstacle
            if (Math.random() < 0.5) {
                const obsType = Object.keys(OBSTACLE_TYPES)[Math.floor(Math.random() * Object.keys(OBSTACLE_TYPES).length)];
                const obsY = y - OBSTACLE_TYPES[obsType].height;
                this.obstacles.push(new Obstacle(x + width/2, obsY, obsType));
            }
            
            // Maybe add cheeseball
            if (Math.random() < 0.3) {
                const powerType = Math.random() < 0.5 ? 'SPEED' : 'JUMP';
                const cheeseballY = y - CHEESEBALL_SIZE - 20;
                this.cheeseballs.push(new Cheeseball(x + width/2, cheeseballY, powerType));
            }
            
            x += width + Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            this.gameLoop();
        }
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        if (!this.isPaused && !this.gameOver) {
            this.update(deltaTime);
        }
        
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update player
        this.player.update(deltaTime);
        
        // Update game objects
        this.platforms.forEach(platform => platform.update(this.scrollSpeed));
        this.obstacles.forEach(obstacle => obstacle.update(this.scrollSpeed));
        this.cats.forEach(cat => cat.update(this.player, this.platforms));
        this.cheeseballs.forEach(ball => ball.update(this.scrollSpeed));
        
        // Remove off-screen objects
        this.platforms = this.platforms.filter(p => p.x + p.width > 0);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);
        this.cats = this.cats.filter(c => c.x + c.width > -100);
        this.cheeseballs = this.cheeseballs.filter(b => b.x + b.size > 0);
        
        // Generate new chunks if needed
        if (this.platforms[this.platforms.length - 1].x + this.platforms[this.platforms.length - 1].width < WINDOW_WIDTH) {
            this.generateInitialChunk();
        }
        
        // Spawn new cats
        const currentTime = performance.now();
        if (currentTime - this.lastCatSpawn > CAT_SPAWN_INTERVAL) {
            this.cats.push(new Cat(WINDOW_WIDTH + 50, GROUND_HEIGHT - CAT_HEIGHT));
            this.lastCatSpawn = currentTime;
        }
        
        // Update score and difficulty
        this.score += SCORE_PER_DISTANCE;
        this.scrollSpeed += DIFFICULTY_INCREASE_RATE / FPS;
        
        // Check collisions
        this.checkCollisions();
        
        // Check level progression
        this.checkLevelProgression();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = LEVELS[this.currentLevel].background;
        this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Draw ground
        this.ctx.fillStyle = LEVELS[this.currentLevel].ground;
        this.ctx.fillRect(0, GROUND_HEIGHT, WINDOW_WIDTH, WINDOW_HEIGHT - GROUND_HEIGHT);
        
        // Draw game objects
        this.platforms.forEach(platform => platform.draw(this.ctx, LEVELS[this.currentLevel].platform));
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        this.cats.forEach(cat => cat.draw(this.ctx));
        this.cheeseballs.forEach(ball => ball.draw(this.ctx));
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw HUD
        this.drawHUD();
        
        // Draw level message
        if (this.levelMessageTimer > 0) {
            this.drawLevelMessage();
            this.levelMessageTimer--;
        }
        
        // Draw game over message
        if (this.gameOver) {
            this.drawGameOver();
        }
        
        // Draw pause overlay
        if (this.isPaused) {
            this.drawPauseOverlay();
        }
    }

    drawHUD() {
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = WHITE;
        this.ctx.textAlign = 'left';
        
        // Draw score
        this.ctx.fillText(`Score: ${Math.floor(this.score)}`, 10, 30);
        
        // Draw health
        this.ctx.fillText(`Health: ${this.player.unlimited_health ? '∞' : this.player.health}`, 10, 60);
        
        // Draw level
        this.ctx.fillText(`Level: ${this.currentLevel} - ${LEVELS[this.currentLevel].name}`, 10, 90);
        
        // Draw active power-ups
        if (this.player.speedBoost) {
            this.ctx.fillStyle = CHEESEBALL_COLORS.SPEED;
            this.ctx.fillText('SPEED BOOST!', 10, 120);
        }
        if (this.player.jumpBoost) {
            this.ctx.fillStyle = CHEESEBALL_COLORS.JUMP;
            this.ctx.fillText('JUMP BOOST!', 10, 150);
        }
    }

    drawLevelMessage() {
        const alpha = Math.min(1, this.levelMessageTimer / LEVEL_FADE_DURATION);
        this.ctx.globalAlpha = alpha;
        this.ctx.font = '36px Arial';
        this.ctx.fillStyle = WHITE;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(LEVELS[this.currentLevel].message, WINDOW_WIDTH/2, WINDOW_HEIGHT/3);
        this.ctx.globalAlpha = 1;
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = WHITE;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', WINDOW_WIDTH/2, WINDOW_HEIGHT/2 - 50);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press R to restart', WINDOW_WIDTH/2, WINDOW_HEIGHT/2 + 50);
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = WHITE;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', WINDOW_WIDTH/2, WINDOW_HEIGHT/2 - 50);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press P to resume', WINDOW_WIDTH/2, WINDOW_HEIGHT/2 + 50);
    }

    checkCollisions() {
        // Platform collisions
        for (const platform of this.platforms) {
            if (this.player.checkPlatformCollision(platform)) {
                break;
            }
        }
        
        // Obstacle collisions
        for (const obstacle of this.obstacles) {
            if (this.player.checkObstacleCollision(obstacle)) {
                if (this.player.health <= 0) {
                    this.gameOver = true;
                    if (this.superBassAudio) this.superBassAudio.pause();
                }
                break;
            }
        }
        
        // Cat collisions
        for (const cat of this.cats) {
            if (this.player.checkCatCollision(cat)) {
                if (this.player.health <= 0) {
                    this.gameOver = true;
                    if (this.superBassAudio) this.superBassAudio.pause();
                }
                break;
            }
        }
        
        // Cheeseball collisions
        for (const ball of this.cheeseballs) {
            if (!ball.collected && this.player.checkCheeseballCollision(ball)) {
                this.player.activatePowerUp(ball.type);
                ball.collected = true;
                this.cheeseballs = this.cheeseballs.filter(b => b !== ball);
            }
        }
        
        // Laser collisions
        for (const laser of this.player.lasers) {
            // Check cat collisions
            for (const cat of this.cats) {
                if (laser.checkCollision(cat)) {
                    this.player.lasers = this.player.lasers.filter(l => l !== laser);
                    this.cats = this.cats.filter(c => c !== cat);
                    this.score += CAT_ELIMINATION_SCORE;
                    break;
                }
            }
            
            // Check obstacle collisions
            for (const obstacle of this.obstacles) {
                if (laser.checkCollision(obstacle)) {
                    this.player.lasers = this.player.lasers.filter(l => l !== laser);
                    this.obstacles = this.obstacles.filter(o => o !== obstacle);
                    this.score += CAT_ELIMINATION_SCORE / 2;
                    break;
                }
            }
        }
    }

    checkLevelProgression() {
        for (let level = Object.keys(LEVELS).length; level > 0; level--) {
            if (this.score >= LEVELS[level].score_required && this.currentLevel < level) {
                this.currentLevel = level;
                this.levelMessageTimer = LEVEL_MESSAGE_DURATION;
                
                // Play superbass.mp3 when entering Level 6
                if (level === 6 && this.superBassAudio) {
                    this.superBassAudio.currentTime = 0;
                    this.superBassAudio.play();
                }
                
                // Increase difficulty
                this.scrollSpeed *= SPEED_SCALE_FACTOR;
                return true;
            }
        }
        return false;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused && this.superBassAudio) {
            this.superBassAudio.pause();
        } else if (!this.isPaused && this.superBassAudio && this.currentLevel === 6) {
            this.superBassAudio.play();
        }
    }

    restart() {
        // Reset game state
        this.score = 0;
        this.currentLevel = 1;
        this.levelMessageTimer = LEVEL_MESSAGE_DURATION;
        this.scrollSpeed = SCROLL_SPEED;
        this.gameOver = false;
        this.isPaused = false;
        
        // Reset game objects
        this.player = new Player();
        this.platforms = [];
        this.obstacles = [];
        this.cats = [];
        this.cheeseballs = [];
        this.lastCatSpawn = 0;
        this.lastCheeseballSpawn = 0;
        
        // Stop music
        if (this.superBassAudio) {
            this.superBassAudio.pause();
            this.superBassAudio.currentTime = 0;
        }
        
        // Generate new level
        this.generateInitialChunk();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
}); 