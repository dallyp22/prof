class Player {
    constructor(game) {
        this.game = game;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.normalHeight = PLAYER_HEIGHT;
        this.x = CANVAS_WIDTH / 4;
        this.y = GROUND_HEIGHT - this.height;
        this.velX = 0;
        this.velY = 0;
        this.jumping = false;
        this.squatting = false;
        this.doubleJumpAvailable = true;
        this.health = INITIAL_HEALTH;
        this.state = PLAYER_STATES.IDLE;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.particles = [];
        this.animationTime = 0;
        this.rotation = 0;
        this.facingRight = true;

        // Power-up states
        this.speedBoost = false;
        this.jumpBoost = false;
        this.speedBoostTimer = 0;
        this.jumpBoostTimer = 0;
        this.powerUpMessage = "";
        this.messageTimer = 0;

        // Load player image
        this.image = new Image();
        this.image.src = '/static/Ryan.PNG';
    }

    update() {
        // Update power-up timers
        const currentTime = Date.now();
        
        if (this.speedBoost && currentTime > this.speedBoostTimer) {
            this.speedBoost = false;
        }
        
        if (this.jumpBoost && currentTime > this.jumpBoostTimer) {
            this.jumpBoost = false;
        }
        
        if (this.messageTimer > 0) {
            this.messageTimer--;
        }

        // Handle squatting
        if (this.game.keys.ArrowDown) {
            if (!this.squatting && !this.jumping) {
                this.squatting = true;
                this.height = PLAYER_SQUAT_HEIGHT;
                this.y = GROUND_HEIGHT - this.height;
                this.state = PLAYER_STATES.SQUATTING;
            }
        } else if (this.squatting) {
            this.squatting = false;
            this.height = this.normalHeight;
            this.y = GROUND_HEIGHT - this.height;
            this.state = PLAYER_STATES.IDLE;
        }

        // Handle horizontal movement
        this.velX = 0;
        if (this.game.keys.ArrowLeft) {
            this.velX = -PLAYER_SPEED * (this.speedBoost ? SPEED_BOOST_MULTIPLIER : 1);
            if (this.squatting) {
                this.velX *= PLAYER_SQUAT_SPEED / PLAYER_SPEED;
            }
            this.facingRight = false;
        }
        if (this.game.keys.ArrowRight) {
            this.velX = PLAYER_SPEED * (this.speedBoost ? SPEED_BOOST_MULTIPLIER : 1);
            if (this.squatting) {
                this.velX *= PLAYER_SQUAT_SPEED / PLAYER_SPEED;
            }
            this.facingRight = true;
        }

        // Update position
        this.x += this.velX;
        this.x = Math.max(0, Math.min(this.x, CANVAS_WIDTH - this.width));

        // Apply gravity
        this.velY += GRAVITY;
        this.y += this.velY;

        // Ground collision
        if (this.y > GROUND_HEIGHT - this.height) {
            this.y = GROUND_HEIGHT - this.height;
            this.velY = 0;
            this.jumping = false;
            if (Math.abs(this.velY) < 0.1 && !this.squatting) {
                this.state = PLAYER_STATES.RUNNING;
            }
        }

        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Update particles
        this.particles = this.particles.filter(p => p.lifetime > 0);
        this.particles.forEach(p => {
            p.x += p.velX;
            p.y += p.velY;
            p.lifetime--;
        });

        // Update animation
        this.animationTime++;
        if (this.jumping) {
            this.rotation = -CHARACTER_TILT_MAX * (this.velY / PLAYER_JUMP_POWER);
        } else if (!this.squatting) {
            this.rotation = CHARACTER_TILT_MAX * Math.sin(this.animationTime * CHARACTER_WOBBLE_SPEED);
        }
    }

    jump() {
        if (this.squatting) return;

        const jumpPower = PLAYER_JUMP_POWER * (this.jumpBoost ? JUMP_BOOST_MULTIPLIER : 1);
        if (!this.jumping) {
            this.velY = jumpPower;
            this.jumping = true;
            this.doubleJumpAvailable = true;
            this.state = PLAYER_STATES.JUMPING;
            this.spawnParticles();
        } else if (this.doubleJumpAvailable) {
            this.velY = jumpPower * 0.8;
            this.doubleJumpAvailable = false;
            this.spawnParticles();
            this.spawnParticles();
        }
    }

    takeDamage() {
        if (!this.invulnerable) {
            this.health--;
            this.invulnerable = true;
            this.invulnerableTimer = 60;
            this.state = PLAYER_STATES.HURT;
            this.spawnParticles();
            
            // Update health display
            document.getElementById('health').textContent = this.health;
        }
    }

    activatePowerUp(powerType) {
        const currentTime = Date.now();
        if (powerType === 'SPEED') {
            this.speedBoost = true;
            this.speedBoostTimer = currentTime + POWER_UP_DURATION;
        } else if (powerType === 'JUMP') {
            this.jumpBoost = true;
            this.jumpBoostTimer = currentTime + POWER_UP_DURATION;
        }
        
        this.powerUpMessage = POWER_UP_MESSAGES[powerType];
        this.messageTimer = MESSAGE_DURATION;
        
        for (let i = 0; i < PARTICLE_COUNT * 2; i++) {
            this.spawnParticles();
        }
    }

    spawnParticles() {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                velX: Math.cos(angle) * speed,
                velY: Math.sin(angle) * speed,
                color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
                lifetime: PARTICLE_LIFETIME
            });
        }
    }

    draw(ctx) {
        // Draw power-up message if active
        if (this.messageTimer > 0) {
            ctx.save();
            ctx.font = '20px Arial';
            ctx.fillStyle = `rgba(255, 255, 255, ${this.messageTimer < MESSAGE_FADE_TIME ? this.messageTimer / MESSAGE_FADE_TIME : 1})`;
            ctx.textAlign = 'center';
            ctx.fillText(this.powerUpMessage, this.x + this.width/2, this.y - 20);
            ctx.restore();
        }

        // Draw particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw player
        if (!this.invulnerable || Math.floor(Date.now() / 200) % 2) {
            const bounceOffset = !this.jumping && !this.squatting ? 
                Math.sin(this.animationTime * CHARACTER_BOUNCE_SPEED) * CHARACTER_BOUNCE_AMPLITUDE : 0;

            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2 + bounceOffset);
            ctx.rotate(this.rotation * Math.PI / 180);
            
            if (this.image.complete) {
                const drawWidth = this.squatting ? this.height * (this.image.width / this.image.height) : this.width;
                ctx.scale(this.facingRight ? 1 : -1, 1);
                ctx.drawImage(this.image, -drawWidth/2, -this.height/2, drawWidth, this.height);
            }
            
            ctx.restore();
        }
    }
} 