class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        this.player = new Player(this);
        this.level = 1;
        this.score = 0;
        this.enemies = [];
        this.lasers = [];
        this.platforms = [];
        this.cheeseballs = [];
        
        // Add keyboard controls
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        
        this.init();
    }

    init() {
        // Load assets
        AssetLoader.loadAll(() => {
            this.start();
        });
    }

    start() {
        // Initialize platforms for the current level
        this.platforms = LevelManager.createPlatforms(this);
        this.gameLoop();
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Handle player controls
        if (this.keys['ArrowRight']) {
            this.player.modifySpeed('right');
        }
        if (this.keys['ArrowLeft']) {
            this.player.modifySpeed('left');
        }
        if (this.keys['Space']) {
            this.player.jump();
        }
        if (this.keys['KeyX']) {
            this.player.shoot();
        }

        this.player.update();
        
        // Update lasers
        this.lasers.forEach(laser => laser.update());
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update());

        // Update cheeseballs
        this.cheeseballs.forEach(cheeseball => cheeseball.update());
        
        // Check platform collisions
        this.platforms.forEach(platform => {
            if (this.player.velocityY >= 0 && // Only check when falling
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height >= platform.y &&
                this.player.y < platform.y) {
                this.player.y = platform.y - this.player.height;
                this.player.velocityY = 0;
                this.player.isJumping = false;
            }
        });
        
        this.checkCollisions();
        this.updateLevel();

        // Spawn cheeseballs periodically
        if (Math.random() < 0.01) { // 1% chance each frame
            this.cheeseballs.push(new Cheeseball(
                this,
                Math.random() * (this.canvas.width - 20),
                Math.random() * (this.canvas.height - 100)
            ));
        }

        // Update health display
        document.getElementById('healthValue').textContent = this.player.health;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        LevelManager.drawBackground(this.ctx, this.level);
        
        // Render platforms
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        // Render cheeseballs
        this.cheeseballs.forEach(cheeseball => cheeseball.render(this.ctx));
        
        this.player.render(this.ctx);
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.lasers.forEach(laser => laser.render(this.ctx));
    }

    checkCollisions() {
        // Check laser hits
        this.lasers.forEach((laser, laserIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(laser, enemy)) {
                    if (enemy instanceof CatlockBoss) {
                        enemy.health -= 10;
                        if (enemy.health <= 0) {
                            this.enemies.splice(enemyIndex, 1);
                            this.score += 100;
                        }
                    } else {
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 10;
                    }
                    this.lasers.splice(laserIndex, 1);
                }
            });
        });

        // Check player collision with enemies
        this.enemies.forEach((enemy) => {
            if (this.checkCollision(this.player, enemy)) {
                this.player.health -= 10;
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });

        // Check player collision with cheeseballs
        this.cheeseballs.forEach((cheeseball, index) => {
            if (this.checkCollision(this.player, cheeseball)) {
                this.score += 5;
                this.player.health = Math.min(100, this.player.health + 5);
                this.cheeseballs.splice(index, 1);
            }
        });
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    gameOver() {
        alert(`Game Over! Score: ${this.score}`);
        this.level = 1;
        this.score = 0;
        this.enemies = [];
        this.lasers = [];
        this.cheeseballs = [];
        this.player.x = 50;
        this.player.y = this.canvas.height - this.player.height - 10;
        this.player.health = 100;
        this.platforms = LevelManager.createPlatforms(this);
    }

    updateLevel() {
        // Spawn enemies
        LevelManager.spawnEnemies(this);

        // Clean up off-screen objects
        this.enemies = this.enemies.filter(enemy => enemy.x + enemy.width > 0);
        this.lasers = this.lasers.filter(laser => laser.x < this.canvas.width);
        this.cheeseballs = this.cheeseballs.filter(cheeseball => !cheeseball.collected);

        // Update score display
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('levelValue').textContent = this.level;

        // Check for level completion
        if (this.score >= this.level * 100 && !this.enemies.length) {
            if (this.level < LevelManager.levels.length) {
                this.level++;
                this.platforms = LevelManager.createPlatforms(this);
                alert(`Level ${this.level}! ${LevelManager.getCurrentLevel(this.level).message}`);
            } else {
                alert('Congratulations! You beat the game!');
                this.level = 1;
                this.score = 0;
                this.platforms = LevelManager.createPlatforms(this);
            }
        }
    }
}

// Start the game when window loads
window.onload = () => {
    new Game();
}; 