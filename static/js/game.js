class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = WINDOW_WIDTH;
        this.canvas.height = WINDOW_HEIGHT;
        
        // Initialize arrays
        this.catlockFrames = [];
        this.catlockFrame = 0;
        
        // Load assets
        this.loadAssets();
        
        // Initialize game state
        this.reset();
        
        // Set up event listeners
        this.setupControls();
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Initialize cheat code buffer
        this.inputBuffer = '';
        this.lastInputTime = 0;
        this.inputTimeout = 1000; // Clear buffer after 1 second of no input
        
        // Initialize cheat overlay elements
        this.cheatOverlay = document.getElementById('cheatOverlay');
        this.cheatInput = document.getElementById('cheatInput');
        this.submitCheatBtn = document.getElementById('submitCheat');
        this.cancelCheatBtn = document.getElementById('cancelCheat');
        
        // Set up cheat overlay handlers
        this.setupCheatOverlay();
        
        // Add keyboard event listener for opening cheat overlay
        document.addEventListener('keydown', (event) => {
            if (event.key === 'c' || event.key === 'C') {
                event.preventDefault(); // Prevent 'c' from being typed in the input
                this.openCheatOverlay();
            }
        });
        
        // Initialize boss state
        this.bossHealth = 10;
        this.bossHit = false;
        this.bossHitTimer = 0;
        this.bossPhase = 0;
        this.bossTime = 0;
        
        // Initialize cat law facts with southern gentleman personality
        this.catLawFacts = [
            "Why howdy there! Allow me to introduce myself - I'm Catlock, the distinguished feline lawman",
            "As your humble servant Catlock, I must declare that all yarn balls are subject to immediate confiscation",
            "I do declare, as Catlock, that afternoon tea time is a sacred ritual for all distinguished cats",
            "Bless your heart! Catlock here to remind you that scratching posts are mandatory in every parlor",
            "Y'all mind if I, Catlock, mention that napping in sunbeams is constitutionally protected?",
            "As the honorable Catlock, I must insist that treats be served on silver platters",
            "Well butter my biscuit! Catlock's decree: all boxes are sovereign cat territory",
            "I say, I say! Catlock here, reminding you that birds must maintain a respectful distance",
            "Your gracious host Catlock declares that midnight zoomies are a time-honored tradition",
            "As the distinguished Catlock, I must enforce the law against unauthorized belly rubs"
        ];
        this.currentCatLawIndex = 0;
        this.catLawTimer = 0;
        this.catLawDisplayTime = 5000; // Display each fact for 5 seconds
    }
    
    loadAssets() {
        // Load images
        this.ryanSprite = document.getElementById('ryanSprite');
        this.dalbirdSprite = document.getElementById('dalbirdSprite');
        this.villainSprite = document.getElementById('villainSprite');
        this.catlockGif = document.getElementById('catlockGif');
        
        // Load audio
        this.superBassAudio = document.getElementById('superBassAudio');
        
        // Initialize Catlock frames array
        this.catlockFrames = [];
        
        // Create an Image object to handle the GIF
        if (this.catlockGif) {
            // Store the original GIF for animation
            this.catlockFrames.push(this.catlockGif);
        }
    }
    
    reset() {
        this.score = 0;
        this.health = INITIAL_HEALTH;
        this.currentLevel = 1;
        this.gameOver = false;
        this.paused = false;
        
        // Player state
        this.player = {
            x: WINDOW_WIDTH / 4,
            y: PLAYER.GROUND_HEIGHT - PLAYER.HEIGHT,
            width: PLAYER.WIDTH,
            height: PLAYER.HEIGHT,
            velX: 0,
            velY: 0,
            jumping: false,
            doubleJumpAvailable: true,
            squatting: false,
            animationTime: 0,
            rotation: 0,
            facingRight: true,
            invulnerable: false,
            invulnerableTimer: 0,
            superJumpAvailable: false
        };
        
        // Game objects
        this.platforms = [];
        this.obstacles = [];
        this.cats = [];
        this.lasers = [];
        this.powerUps = [];
        
        // Generate initial platforms
        this.generateChunk();
        
        // Initialize Catlock state
        this.catlockHealth = 5; // Takes 5 hits to defeat
        this.catlockHit = false;
        this.catlockHitTimer = 0;
        
        // Reset cheat code buffer
        this.inputBuffer = '';
        this.lastInputTime = 0;
        
        // Reset boss state
        this.bossHealth = 10;
        this.bossHit = false;
        this.bossHitTimer = 0;
        this.bossPhase = 0;
        this.bossTime = 0;
    }
    
    setupCheatOverlay() {
        if (!this.cheatOverlay || !this.cheatInput || !this.submitCheatBtn || !this.cancelCheatBtn) {
            console.error('Cheat overlay elements not found!');
            return;
        }

        // Submit cheat code
        this.submitCheatBtn.addEventListener('click', () => {
            if (this.cheatInput.value) {
                this.handleCheatCode(this.cheatInput.value);
                this.closeCheatOverlay();
            }
        });
        
        // Submit on Enter key
        this.cheatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && this.cheatInput.value) {
                event.preventDefault();
                this.handleCheatCode(this.cheatInput.value);
                this.closeCheatOverlay();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                this.closeCheatOverlay();
            }
        });
        
        // Cancel button
        this.cancelCheatBtn.addEventListener('click', () => {
            this.closeCheatOverlay();
        });

        // Click outside to close
        this.cheatOverlay.addEventListener('click', (event) => {
            if (event.target === this.cheatOverlay) {
                this.closeCheatOverlay();
            }
        });
    }
    
    openCheatOverlay() {
        if (this.cheatOverlay) {
            this.cheatOverlay.style.display = 'flex';
            if (this.cheatInput) {
                this.cheatInput.value = '';
                this.cheatInput.focus();
            }
            this.paused = true;
        }
    }
    
    handleCheatCode(code) {
        // Remove any spaces and convert to lowercase
        code = code.replace(/\s+/g, '').toLowerCase();
        
        let message = '';
        
        switch(code) {
            case 'dalbird':
                this.score += 1000;
                message = '+1000 points';
                break;
                
            case 'catlock':
                this.health = Math.min(this.health + 1, 5);
                message = '+1 health';
                break;
                
            case 'ryan':
                this.player.invulnerable = true;
                this.player.invulnerableTimer = 300;
                message = 'Temporary invincibility';
                break;
                
            case 'superbass':
                if (this.superBassAudio) {
                    if (this.superBassAudio.paused) {
                        this.superBassAudio.play();
                        message = 'Music on';
                    } else {
                        this.superBassAudio.pause();
                        message = 'Music off';
                    }
                }
                break;
                
            case 'huggyb':
                this.health = Infinity;
                this.player.invulnerable = true;
                this.player.invulnerableTimer = Infinity;
                message = 'Unlimited health activated';
                break;
                
            default:
                message = 'Invalid cheat code';
                break;
        }
        
        // Show floating message
        this.showFloatingMessage(message);
        
        // Update UI immediately after cheat
        this.updateUI();
        
        // Close overlay and resume game immediately
        this.cheatOverlay.style.display = 'none';
        this.cheatInput.value = '';
        this.paused = false;
        
        // Reset any pending input
        this.player.velX = 0;
        this.player.velY = 0;
    }
    
    showFloatingMessage(message) {
        // Create floating message element
        const messageEl = document.createElement('div');
        messageEl.textContent = 'CHEAT: ' + message;
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 20px;
            z-index: 1000;
            pointer-events: none;
            animation: fadeOut 2s forwards;
        `;
        
        // Add animation style if it doesn't exist
        if (!document.getElementById('fadeOutAnimation')) {
            const style = document.createElement('style');
            style.id = 'fadeOutAnimation';
            style.textContent = `
                @keyframes fadeOut {
                    0% { opacity: 1; transform: translate(-50%, -50%); }
                    70% { opacity: 1; transform: translate(-50%, -60%); }
                    100% { opacity: 0; transform: translate(-50%, -70%); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageEl);
        
        // Remove the message after animation
        setTimeout(() => {
            messageEl.remove();
        }, 2000);
    }
    
    closeCheatOverlay() {
        if (this.cheatOverlay) {
            this.cheatOverlay.style.display = 'none';
            if (this.cheatInput) {
                this.cheatInput.value = '';
            }
            // Resume game immediately
            this.paused = false;
            // Reset any pending input
            if (this.player) {
                this.player.velX = 0;
                this.player.velY = 0;
            }
        }
    }
    
    updateUI() {
        // Update UI elements
        const score = document.getElementById('score');
        const health = document.getElementById('health');
        const level = document.getElementById('level');
        
        if (score) score.textContent = `Score: ${Math.floor(this.score)}`;
        if (health) {
            if (this.health === Infinity) {
                health.textContent = 'Health: ∞';
            } else {
                health.textContent = `Health: ${this.health}`;
            }
        }
        if (level) {
            level.textContent = `Level: ${this.currentLevel} - ${LEVELS[this.currentLevel].name}`;
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (event) => {
            if (this.gameOver) {
                if (event.key === 'r' || event.key === 'R') {
                    this.reset();
                }
                return;
            }

            // Handle regular game controls
            switch (event.key) {
                case 'ArrowLeft':
                    this.player.velX = -PLAYER.SPEED;
                    this.player.facingRight = false;
                    break;
                case 'ArrowRight':
                    this.player.velX = PLAYER.SPEED;
                    this.player.facingRight = true;
                    break;
                case 'ArrowUp':
                case ' ':
                    this.jump();
                    break;
                case 'ArrowDown':
                    if (!this.player.jumping) {
                        this.player.squatting = true;
                        this.player.height = PLAYER.SQUAT_HEIGHT;
                        this.player.velX = this.player.velX > 0 ? 
                            Math.min(this.player.velX, PLAYER.SQUAT_SPEED) : 
                            Math.max(this.player.velX, -PLAYER.SQUAT_SPEED);
                    }
                    break;
                case 'x':
                case 'X':
                    this.shootLaser();
                    break;
                case 'p':
                case 'P':
                    this.paused = !this.paused;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    if (this.player.velX < 0) this.player.velX = 0;
                    break;
                case 'ArrowRight':
                    if (this.player.velX > 0) this.player.velX = 0;
                    break;
                case 'ArrowDown':
                    this.player.squatting = false;
                    this.player.height = PLAYER.HEIGHT;
                    break;
            }
        });
    }
    
    jump() {
        if (this.player.squatting) return;
        
        if (!this.player.jumping) {
            // Check for super jump
            if (this.player.superJumpAvailable) {
                this.player.velY = PLAYER.JUMP_POWER * 1.5; // 50% stronger jump
                this.player.superJumpAvailable = false;
            } else {
                this.player.velY = PLAYER.JUMP_POWER;
            }
            this.player.jumping = true;
            this.player.doubleJumpAvailable = true;
        } else if (this.player.doubleJumpAvailable) {
            this.player.velY = PLAYER.DOUBLE_JUMP_POWER;
            this.player.doubleJumpAvailable = false;
        }
    }
    
    shootLaser() {
        const laserSpeed = 10;
        const laserWidth = 20;
        const laserHeight = 8;
        
        // Create new laser
        this.lasers.push({
            x: this.player.x + this.player.width,
            y: this.player.y + this.player.height/2 - laserHeight/2,
            width: laserWidth,
            height: laserHeight,
            velX: laserSpeed
        });
    }
    
    generateChunk() {
        let x = WINDOW_WIDTH;
        while (x < WINDOW_WIDTH * 2) {
            const width = PLATFORM.MIN_WIDTH + Math.random() * (PLATFORM.MAX_WIDTH - PLATFORM.MIN_WIDTH);
            const y = PLAYER.GROUND_HEIGHT - Math.random() * PLATFORM.HEIGHT_VARIANCE;
            
            // Add platform
            this.platforms.push({
                x: x,
                y: y,
                width: width,
                height: PLATFORM.HEIGHT
            });
            
            // Add cheese balls (power-ups) - increased chance and better positioning
            if (Math.random() < 0.6) { // 60% chance for cheese
                this.powerUps.push({
                    x: x + width/2 - 15, // Center on platform
                    y: y - 50, // Float higher above platform
                    width: 30,
                    height: 30,
                    type: 'cheese',
                    collected: false,
                    bobOffset: Math.random() * Math.PI * 2
                });
            }
            
            // Add Dalbird (flying enemy)
            if (Math.random() < 0.7) {
                const obstacleHeight = 50;
                this.obstacles.push({
                    x: x + width/2,
                    y: y - obstacleHeight - Math.random() * 100,
                    width: 50,
                    height: obstacleHeight,
                    type: 'dalbird',
                    animationTime: 0,
                    isFlying: true
                });
            }
            
            // Add Catlock (ground enemy)
            if (Math.random() < 0.6) {
                const catlockHeight = 60;
                this.obstacles.push({
                    x: x + width/2,
                    y: PLAYER.GROUND_HEIGHT - catlockHeight,
                    width: 60,
                    height: catlockHeight,
                    type: 'catlock',
                    animationTime: 0,
                    isFlying: false,
                    direction: Math.random() < 0.5 ? -1 : 1,
                    moveSpeed: 2 + Math.random() * 2
                });
            }
            
            x += width + PLATFORM.MIN_GAP + Math.random() * (PLATFORM.MAX_GAP - PLATFORM.MIN_GAP);
        }
    }
    
    update(deltaTime) {
        if (this.gameOver || this.paused) return;
        
        // Update lasers and check collisions
        for (const laser of this.lasers) {
            laser.x += laser.velX;
            
            // Check laser collisions with obstacles
            this.obstacles = this.obstacles.filter(obstacle => {
                if (this.checkCollision(laser, obstacle)) {
                    this.score += 100;
                    return false;
                }
                return true;
            });
            
            // Check laser collision with Catlock in Level 4
            if (this.currentLevel === 4 && this.catlockGif && !this.catlockHit) {
                const catlock = {
                    x: WINDOW_WIDTH - 170,
                    y: WINDOW_HEIGHT/2 - 60,
                    width: 120,
                    height: 120
                };
                
                if (this.checkCollision(laser, catlock)) {
                    this.catlockHealth--;
                    this.catlockHit = true;
                    this.catlockHitTimer = 30; // Flash red for 30 frames
                    this.score += 200;
                    
                    if (this.catlockHealth <= 0) {
                        this.score += 1000; // Bonus for defeating Catlock
                        this.currentLevel = 5;
                    }
                    return;
                }
            }
        }
        
        // Update Catlock hit state
        if (this.catlockHit) {
            this.catlockHitTimer--;
            if (this.catlockHitTimer <= 0) {
                this.catlockHit = false;
            }
        }
        
        // Remove off-screen lasers
        this.lasers = this.lasers.filter(laser => laser.x < WINDOW_WIDTH);
        
        // Update Catlock animation frame
        if (this.currentLevel === 4) {
            this.catlockFrame = Math.floor(performance.now() / 100) % this.catlockFrames.length;
        }
        
        // Update player
        this.player.x += this.player.velX;
        this.player.y += this.player.velY;
        this.player.velY += PLAYER.GRAVITY;
        
        // Ground collision
        if (this.player.y > PLAYER.GROUND_HEIGHT - this.player.height) {
            this.player.y = PLAYER.GROUND_HEIGHT - this.player.height;
            this.player.velY = 0;
            this.player.jumping = false;
        }
        
        // Platform collisions
        for (const platform of this.platforms) {
            if (this.player.y + this.player.height >= platform.y &&
                this.player.y + this.player.height <= platform.y + platform.height &&
                this.player.x + this.player.width > platform.x &&
                this.player.x < platform.x + platform.width) {
                this.player.y = platform.y - this.player.height;
                this.player.velY = 0;
                this.player.jumping = false;
            }
        }
        
        // Obstacle collisions
        for (const obstacle of this.obstacles) {
            if (this.player.x + this.player.width > obstacle.x &&
                this.player.x < obstacle.x + obstacle.width &&
                this.player.y + this.player.height > obstacle.y &&
                this.player.y < obstacle.y + obstacle.height) {
                if (!this.player.invulnerable) {
                    this.health--;
                    this.player.invulnerable = true;
                    this.player.invulnerableTimer = 60;  // Invulnerable for 60 frames
                    if (this.health <= 0) {
                        this.gameOver = true;
                        if (this.superBassAudio) {
                            this.superBassAudio.pause();
                        }
                    }
                }
            }
        }
        
        // Update invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerableTimer--;
            if (this.player.invulnerableTimer <= 0) {
                this.player.invulnerable = false;
            }
        }
        
        // Update platforms and obstacles
        const scrollSpeed = SCROLL_SPEED;
        for (const platform of this.platforms) {
            platform.x -= scrollSpeed;
        }
        for (const obstacle of this.obstacles) {
            obstacle.x -= scrollSpeed;
            obstacle.animationTime += deltaTime;
            
            // Update obstacles with different behaviors
            if (obstacle.type === 'dalbird') {
                // Dalbird flies with bobbing motion
                obstacle.y += Math.sin(obstacle.animationTime * 0.005) * 0.5;
            } else if (obstacle.type === 'catlock') {
                // Catlock moves laterally on the ground
                obstacle.x += obstacle.direction * obstacle.moveSpeed;
                
                // Change direction randomly or when hitting screen bounds
                if (Math.random() < 0.01 || // 1% chance to change direction
                    obstacle.x <= 0 || // Hit left bound
                    obstacle.x >= WINDOW_WIDTH - obstacle.width) { // Hit right bound
                    obstacle.direction *= -1;
                }
            }
        }
        
        // Remove off-screen objects
        this.platforms = this.platforms.filter(p => p.x + p.width > 0);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);
        
        // Generate new chunks if needed
        if (this.platforms.length > 0 && 
            this.platforms[this.platforms.length - 1].x + this.platforms[this.platforms.length - 1].width < WINDOW_WIDTH) {
            this.generateChunk();
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.player.x, WINDOW_WIDTH - this.player.width));
        
        // Update animation time
        this.player.animationTime += deltaTime;
        
        // Update score
        this.score += SCORE_PER_DISTANCE * deltaTime / 1000;
        
        // Check level progression
        for (let level = 7; level >= 1; level--) {
            if (this.score >= LEVELS[level].scoreRequired && this.currentLevel < level) {
                this.currentLevel = level;
                // Play superbass.mp3 when entering Level 6
                if (level === 6 && this.superBassAudio) {
                    this.superBassAudio.currentTime = 0;
                    this.superBassAudio.play();
                }
                break;
            }
        }
        
        // Update power-ups
        for (const powerUp of this.powerUps) {
            if (!powerUp.collected) {
                // Move with platforms
                powerUp.x -= SCROLL_SPEED;
                // Bob up and down
                powerUp.bobOffset += deltaTime * 0.003;
                powerUp.y += Math.sin(powerUp.bobOffset) * 1.5; // Increased bobbing

                // Check collision with player
                if (this.checkCollision(this.player, powerUp)) {
                    powerUp.collected = true;
                    if (powerUp.type === 'cheese') {
                        // Add health and super jump
                        this.health = Math.min(this.health + 1, 5);
                        this.player.superJumpAvailable = true;
                        this.showFloatingMessage('Health +1 & Super Jump Ready!');
                    }
                }
            }
        }

        // Remove collected and off-screen power-ups
        this.powerUps = this.powerUps.filter(p => !p.collected && p.x + p.width > 0);
        
        // Update UI at the end of update
        this.updateUI();
        
        // Update boss in levels 6-8
        if (this.currentLevel >= 6 && this.currentLevel <= 8) {
            this.bossTime += deltaTime * 0.001; // Convert to seconds
            
            // Boss movement pattern - different for each level
            let bossX, bossY;
            switch(this.currentLevel) {
                case 6:
                    // Figure-8 pattern
                    bossX = WINDOW_WIDTH * 0.6 + Math.sin(this.bossTime * 0.5) * 200;
                    bossY = WINDOW_HEIGHT * 0.3 + Math.cos(this.bossTime * 0.7) * 100;
                    break;
                case 7:
                    // Circular pattern
                    bossX = WINDOW_WIDTH * 0.5 + Math.cos(this.bossTime * 0.8) * 250;
                    bossY = WINDOW_HEIGHT * 0.4 + Math.sin(this.bossTime * 0.8) * 150;
                    break;
                case 8:
                    // Aggressive zigzag pattern
                    bossX = WINDOW_WIDTH * 0.5 + Math.sin(this.bossTime * 1.2) * 300;
                    bossY = WINDOW_HEIGHT * 0.3 + Math.abs(Math.sin(this.bossTime * 2)) * 200;
                    break;
            }
            
            // Check laser collisions with boss
            for (const laser of this.lasers) {
                if (!this.bossHit && this.checkCollision(laser, {
                    x: bossX - 100,
                    y: bossY - 100,
                    width: 200,
                    height: 200
                })) {
                    this.bossHealth--;
                    this.bossHit = true;
                    this.bossHitTimer = 30;
                    this.score += 500;
                    
                    if (this.bossHealth <= 0) {
                        this.score += 5000; // Big bonus for defeating the boss
                        this.currentLevel = 9; // Move to victory level
                        if (this.superBassAudio) {
                            this.superBassAudio.pause();
                        }
                    }
                }
            }
            
            // Update boss hit effect
            if (this.bossHit) {
                this.bossHitTimer--;
                if (this.bossHitTimer <= 0) {
                    this.bossHit = false;
                }
            }
        }
        
        // Update Catlock movement and facts in Levels 3-5
        if (this.currentLevel >= 3 && this.currentLevel <= 5) {
            this.catLawTimer += deltaTime;
            if (this.catLawTimer >= this.catLawDisplayTime) {
                this.catLawTimer = 0;
                this.currentCatLawIndex = (this.currentCatLawIndex + 1) % this.catLawFacts.length;
            }

            // Calculate Catlock's position using a figure-8 pattern
            const time = performance.now() * 0.001; // Convert to seconds
            const centerX = WINDOW_WIDTH * 0.7;
            const centerY = WINDOW_HEIGHT * 0.4;
            const radiusX = 150;
            const radiusY = 100;
            
            // Adjust movement pattern based on level
            switch(this.currentLevel) {
                case 3:
                    // Gentle figure-8
                    this.catlockX = centerX + Math.sin(time * 0.4) * radiusX;
                    this.catlockY = centerY + Math.sin(time * 0.8) * radiusY;
                    break;
                case 4:
                    // More elaborate pattern
                    this.catlockX = centerX + Math.sin(time * 0.5) * radiusX * 1.2;
                    this.catlockY = centerY + Math.sin(time * 1.0) * radiusY * 1.1;
                    break;
                case 5:
                    // Faster, more aggressive pattern
                    this.catlockX = centerX + Math.sin(time * 0.6) * radiusX * 1.4;
                    this.catlockY = centerY + Math.sin(time * 1.2) * radiusY * 1.2;
                    break;
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.rgbToStyle(LEVELS[this.currentLevel].background);
        this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Draw villain in background for level 2
        if (this.currentLevel === 2 && this.villainSprite) {
            // Create a semi-transparent overlay effect
            this.ctx.save();
            this.ctx.globalAlpha = 0.2; // Make it semi-transparent
            
            // Calculate size to maintain aspect ratio but fill screen
            const ratio = this.villainSprite.width / this.villainSprite.height;
            let width = WINDOW_WIDTH;
            let height = width / ratio;
            
            if (height < WINDOW_HEIGHT) {
                height = WINDOW_HEIGHT;
                width = height * ratio;
            }
            
            // Center the image
            const x = (WINDOW_WIDTH - width) / 2;
            const y = (WINDOW_HEIGHT - height) / 2;
            
            // Draw the villain sprite
            this.ctx.drawImage(this.villainSprite, x, y, width, height);
            this.ctx.restore();
        }
        
        // Draw ground
        this.ctx.fillStyle = this.rgbToStyle(LEVELS[this.currentLevel].ground);
        this.ctx.fillRect(0, PLAYER.GROUND_HEIGHT, WINDOW_WIDTH, WINDOW_HEIGHT - PLAYER.GROUND_HEIGHT);
        
        // Draw platforms
        this.ctx.fillStyle = this.rgbToStyle(LEVELS[this.currentLevel].platform);
        for (const platform of this.platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Add shading
            this.ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
            this.ctx.fillRect(platform.x, platform.y + platform.height - 4, platform.width, 4);
            this.ctx.fillStyle = this.rgbToStyle(LEVELS[this.currentLevel].platform);
        }
        
        // Draw obstacles with proper scaling and orientation
        for (const obstacle of this.obstacles) {
            this.ctx.save();
            
            if (obstacle.type === 'dalbird' && this.dalbirdSprite) {
                this.ctx.drawImage(this.dalbirdSprite, 
                    obstacle.x, obstacle.y, 
                    obstacle.width, obstacle.height);
            } else if (obstacle.type === 'catlock' && this.catlockGif) {
                // Flip Catlock based on movement direction
                if (obstacle.direction < 0) {
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(this.catlockGif, 
                        -obstacle.x - obstacle.width, obstacle.y, 
                        obstacle.width, obstacle.height);
                } else {
                    this.ctx.drawImage(this.catlockGif, 
                        obstacle.x, obstacle.y, 
                        obstacle.width, obstacle.height);
                }
            }
            
            this.ctx.restore();
        }
        
        // Draw lasers
        this.ctx.fillStyle = 'rgb(255, 0, 0)';
        for (const laser of this.lasers) {
            this.ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
            
            // Add glow effect
            this.ctx.shadowColor = 'red';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
            this.ctx.shadowBlur = 0;
        }

        // Draw Catlock in Levels 3-5 with movement and speech bubble
        if (this.currentLevel >= 3 && this.currentLevel <= 5 && this.catlockGif) {
            const catWidth = 150;
            const catHeight = 150;
            
            // Save context for Catlock effects
            this.ctx.save();
            
            // Apply hit effect
            if (this.catlockHit) {
                this.ctx.globalAlpha = 0.7;
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(this.catlockX - catWidth/2, this.catlockY - catHeight/2, 
                                catWidth, catHeight);
                this.ctx.globalAlpha = 1.0;
            }
            
            // Draw Catlock with glow effect
            this.ctx.shadowColor = 'purple';
            this.ctx.shadowBlur = 20;
            this.ctx.drawImage(this.catlockGif, 
                this.catlockX - catWidth/2, 
                this.catlockY - catHeight/2, 
                catWidth, catHeight);
            this.ctx.shadowBlur = 0;
            
            // Draw health bar
            const healthBarWidth = 120;
            const healthBarHeight = 10;
            const healthPercentage = this.catlockHealth / 5;
            
            // Health bar background
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.fillRect(this.catlockX - healthBarWidth/2,
                            this.catlockY - catHeight/2 - 30,
                            healthBarWidth,
                            healthBarHeight);
            
            // Health bar foreground
            this.ctx.fillStyle = 'rgb(255, 0, 0)';
            this.ctx.fillRect(this.catlockX - healthBarWidth/2,
                            this.catlockY - catHeight/2 - 30,
                            healthBarWidth * healthPercentage,
                            healthBarHeight);
            
            // Draw speech bubble with fancy font for southern gentleman style
            this.ctx.font = 'italic 16px Georgia';
            this.drawSpeechBubble(
                this.catlockX + catWidth/2 + 20,
                this.catlockY - catHeight/2,
                300,
                80,
                this.catLawFacts[this.currentCatLawIndex]
            );
            
            this.ctx.restore();
        }
        
        // Draw power-ups
        for (const powerUp of this.powerUps) {
            if (!powerUp.collected) {
                this.ctx.save();
                
                // Draw glow effect
                this.ctx.shadowColor = 'rgba(255, 191, 0, 0.5)';
                this.ctx.shadowBlur = 15;
                
                // Draw cheese
                this.ctx.fillStyle = this.rgbToStyle(COLORS.CHEESE_COLOR);
                this.ctx.beginPath();
                this.ctx.arc(
                    powerUp.x + powerUp.width/2,
                    powerUp.y + powerUp.height/2,
                    powerUp.width/2,
                    0, Math.PI * 2
                );
                this.ctx.fill();
                
                // Add highlight
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(
                    powerUp.x + powerUp.width/4,
                    powerUp.y + powerUp.height/4,
                    powerUp.width/6,
                    0, Math.PI * 2
                );
                this.ctx.fill();
                
                this.ctx.restore();
            }
        }
        
        // Draw player
        this.drawPlayer();
        
        // Draw boss in levels 6-8
        if (this.currentLevel >= 6 && this.currentLevel <= 8 && this.dalbirdSprite) {
            // Calculate boss position based on level
            let bossX, bossY;
            switch(this.currentLevel) {
                case 6:
                    bossX = WINDOW_WIDTH * 0.6 + Math.sin(this.bossTime * 0.5) * 200;
                    bossY = WINDOW_HEIGHT * 0.3 + Math.cos(this.bossTime * 0.7) * 100;
                    break;
                case 7:
                    bossX = WINDOW_WIDTH * 0.5 + Math.cos(this.bossTime * 0.8) * 250;
                    bossY = WINDOW_HEIGHT * 0.4 + Math.sin(this.bossTime * 0.8) * 150;
                    break;
                case 8:
                    bossX = WINDOW_WIDTH * 0.5 + Math.sin(this.bossTime * 1.2) * 300;
                    bossY = WINDOW_HEIGHT * 0.3 + Math.abs(Math.sin(this.bossTime * 2)) * 200;
                    break;
            }
            
            this.ctx.save();
            
            // Apply hit effect
            if (this.bossHit) {
                this.ctx.globalAlpha = 0.7;
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(bossX - 100, bossY - 100, 200, 200);
                this.ctx.globalAlpha = 1.0;
            }
            
            // Draw the boss with rotation based on movement
            const rotation = Math.atan2(
                Math.cos(this.bossTime * 0.7) * 100,
                Math.sin(this.bossTime * 0.5) * 200
            );
            
            this.ctx.translate(bossX, bossY);
            this.ctx.rotate(rotation);
            
            // Make boss bigger in later levels
            const bossSize = 200 + (this.currentLevel - 6) * 20; // Increases size each level
            this.ctx.drawImage(this.dalbirdSprite, -bossSize/2, -bossSize/2, bossSize, bossSize);
            
            // Draw health bar
            this.ctx.rotate(-rotation); // Reset rotation for health bar
            const healthBarWidth = 180;
            const healthBarHeight = 15;
            const healthPercentage = this.bossHealth / 10;
            
            // Health bar background
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.fillRect(-healthBarWidth/2, -120, healthBarWidth, healthBarHeight);
            
            // Health bar foreground
            this.ctx.fillStyle = 'rgb(255, 0, 0)';
            this.ctx.fillRect(-healthBarWidth/2, -120, healthBarWidth * healthPercentage, healthBarHeight);
            
            this.ctx.restore();
            
            // Draw boss name and health
            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`DALBIRD BOSS - PHASE ${this.currentLevel - 5}`, WINDOW_WIDTH/2, 40);
            this.ctx.fillText(`Health: ${this.bossHealth}/10`, WINDOW_WIDTH/2, 70);
        }
        
        // Draw game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over! Press R to restart', WINDOW_WIDTH/2, WINDOW_HEIGHT/2);
        }
    }
    
    drawPlayer() {
        // Don't draw player during invulnerability frames
        if (this.player.invulnerable && Math.floor(this.player.animationTime * 0.02) % 2 === 0) {
            return;
        }
        
        const bounceOffset = this.player.jumping ? 0 : 
            Math.sin(this.player.animationTime * PLAYER.BOUNCE_SPEED) * PLAYER.BOUNCE_AMPLITUDE;
        
        this.ctx.save();
        this.ctx.translate(
            this.player.x + this.player.width/2,
            this.player.y + this.player.height/2 + bounceOffset
        );
        
        // Apply rotation
        if (this.player.jumping) {
            this.player.rotation = -PLAYER.TILT_MAX * (this.player.velY / PLAYER.JUMP_POWER);
        } else {
            this.player.rotation = PLAYER.TILT_MAX * Math.sin(this.player.animationTime * PLAYER.WOBBLE_SPEED);
        }
        this.ctx.rotate(this.player.rotation * Math.PI / 180);
        
        // Draw the sprite
        if (this.ryanSprite) {
            const width = this.player.squatting ? this.player.width * 1.2 : this.player.width;
            const height = this.player.height;
            this.ctx.scale(this.player.facingRight ? 1 : -1, 1);
            this.ctx.drawImage(this.ryanSprite, -width/2, -height/2, width, height);
        }
        
        this.ctx.restore();
    }
    
    drawSpeechBubble(x, y, width, height, text) {
        const radius = 10;
        const pointSize = 20;
        
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        
        // Draw bubble
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        
        // Draw point
        this.ctx.moveTo(x - pointSize, y + height/2);
        this.ctx.lineTo(x, y + height/2 - pointSize/2);
        this.ctx.lineTo(x, y + height/2 + pointSize/2);
        this.ctx.closePath();
        
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw text
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Word wrap the text
        const words = text.split(' ');
        let line = '';
        let lines = [];
        for (const word of words) {
            const testLine = line + word + ' ';
            if (this.ctx.measureText(testLine).width > width - 20) {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        
        // Draw each line
        lines.forEach((line, i) => {
            this.ctx.fillText(
                line, 
                x + width/2,
                y + height/2 - (lines.length - 1) * 10 + i * 20
            );
        });
    }
    
    rgbToStyle(rgb) {
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
}); 