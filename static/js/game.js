class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        // Initialize game objects
        this.player = new Player(this);
        this.platforms = [];
        this.obstacles = [];
        this.cats = [];
        this.cheeseballs = [];
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        
        // Input handling
        this.keys = {};
        this.setupInputHandlers();
        
        // Start the game loop
        this.lastTime = 0;
        this.accumulator = 0;
        this.timestep = 1000 / 60; // 60 FPS
        
        // Start the game
        this.generateInitialPlatforms();
        this.animate();
    }
    
    setupInputHandlers() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                this.player.jump();
            }
            // Prevent space from scrolling the page
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    generateInitialPlatforms() {
        // Add ground platform
        this.platforms.push({
            x: 0,
            y: GROUND_HEIGHT,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT - GROUND_HEIGHT
        });
    }
    
    update(deltaTime) {
        if (this.gameOver || this.paused) return;
        
        // Update player
        this.player.update();
        
        // Update score
        this.score++;
        document.getElementById('score').textContent = Math.floor(this.score / 10);
        
        // Check for game over
        if (this.player.health <= 0) {
            this.gameOver = true;
            this.saveScore();
        }
        
        // Update game objects
        this.updatePlatforms();
        this.updateObstacles();
        this.updateCats();
        this.updateCheeseballs();
        
        // Check collisions
        this.checkCollisions();
        
        // Generate new obstacles
        if (Math.random() < 0.02) {
            this.generateObstacle();
        }
        
        // Generate power-ups
        if (Math.random() < 0.005) {
            this.generatePowerUp();
        }
    }
    
    updatePlatforms() {
        this.platforms.forEach(platform => {
            platform.x -= 3; // Scroll speed
        });
        
        // Remove off-screen platforms
        this.platforms = this.platforms.filter(platform => platform.x + platform.width > 0);
        
        // Generate new platforms
        if (this.platforms[this.platforms.length - 1].x + this.platforms[this.platforms.length - 1].width < CANVAS_WIDTH) {
            this.generatePlatform();
        }
    }
    
    generatePlatform() {
        const lastPlatform = this.platforms[this.platforms.length - 1];
        const gap = Math.random() * 100 + 50;
        const width = Math.random() * 200 + 100;
        
        this.platforms.push({
            x: lastPlatform.x + lastPlatform.width + gap,
            y: GROUND_HEIGHT,
            width: width,
            height: CANVAS_HEIGHT - GROUND_HEIGHT
        });
    }
    
    generateObstacle() {
        const obstacle = {
            x: CANVAS_WIDTH,
            y: GROUND_HEIGHT - 50,
            width: 30,
            height: 50,
            type: Math.random() < 0.5 ? 'spike' : 'block'
        };
        this.obstacles.push(obstacle);
    }
    
    generatePowerUp() {
        const powerUp = {
            x: CANVAS_WIDTH,
            y: Math.random() * (GROUND_HEIGHT - 100) + 50,
            width: 30,
            height: 30,
            type: Math.random() < 0.5 ? 'SPEED' : 'JUMP'
        };
        this.cheeseballs.push(powerUp);
    }
    
    checkCollisions() {
        // Check obstacle collisions
        this.obstacles.forEach(obstacle => {
            if (this.checkCollision(this.player, obstacle)) {
                this.player.takeDamage();
            }
        });
        
        // Check power-up collisions
        this.cheeseballs.forEach((powerUp, index) => {
            if (this.checkCollision(this.player, powerUp)) {
                this.player.activatePowerUp(powerUp.type);
                this.cheeseballs.splice(index, 1);
            }
        });
    }
    
    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw platforms
        this.ctx.fillStyle = '#333333';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Draw obstacles
        this.ctx.fillStyle = '#FF0000';
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw power-ups
        this.cheeseballs.forEach(powerUp => {
            this.ctx.fillStyle = powerUp.type === 'SPEED' ? '#FFD700' : '#00FF00';
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, 
                        powerUp.width/2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Score: ${Math.floor(this.score/10)}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 40);
            this.ctx.fillText('Press Space to Restart', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 80);
        }
    }
    
    animate(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.timestep) {
            this.update(this.timestep);
            this.accumulator -= this.timestep;
        }
        
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }
    
    saveScore() {
        const finalScore = Math.floor(this.score/10);
        fetch('/api/save_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: finalScore })
        });
    }
    
    restart() {
        // Reset game state
        this.score = 0;
        this.gameOver = false;
        this.platforms = [];
        this.obstacles = [];
        this.cats = [];
        this.cheeseballs = [];
        
        // Reset player
        this.player = new Player(this);
        
        // Reset platforms
        this.generateInitialPlatforms();
        
        // Update score display
        document.getElementById('score').textContent = '0';
        document.getElementById('health').textContent = INITIAL_HEALTH;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
    
    // Add restart functionality
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && game.gameOver) {
            game.restart();
        }
    });
}); 