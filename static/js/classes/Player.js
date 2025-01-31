class Player {
    constructor() {
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.normalHeight = PLAYER_HEIGHT;
        this.x = WINDOW_WIDTH / 4;
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

        // Cheat code states
        this.unlimitedHealth = false;
        this.cheatCodeBuffer = "";
        this.cheatCode = "HuggyB";
        this.lastShotTime = 0;
        this.lasers = [];
    }

    update(deltaTime) {
        // Update power-up timers
        const currentTime = performance.now();
        
        if (this.speedBoost && currentTime > this.speedBoostTimer) {
            this.speedBoost = false;
        }
        
        if (this.jumpBoost && currentTime > this.jumpBoostTimer) {
            this.jumpBoost = false;
        }
        
        if (this.messageTimer > 0) {
            this.messageTimer--;
        }

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
        for (const p of this.particles) {
            p.x += p.velX;
            p.y += p.velY;
            p.lifetime--;
        }

        // Update animation
        this.animationTime++;
        if (this.jumping) {
            this.rotation = -CHARACTER_TILT_MAX * (this.velY / PLAYER_JUMP_POWER);
        } else if (!this.squatting) {
            this.rotation = CHARACTER_TILT_MAX * Math.sin(this.animationTime * CHARACTER_WOBBLE_SPEED);
        }

        // Update lasers
        this.lasers.forEach(laser => laser.update());
        this.lasers = this.lasers.filter(laser => laser.x < WINDOW_WIDTH);

        // Update facing direction based on movement
        if (this.velX > 0) {
            this.facingRight = true;
        } else if (this.velX < 0) {
            this.facingRight = false;
        }
    }

    draw(ctx) {
        // Draw particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw lasers
        this.lasers.forEach(laser => laser.draw(ctx));

        // Skip drawing player if invulnerable and blinking
        if (this.invulnerable && Math.floor(performance.now() / 100) % 2) {
            return;
        }

        // Calculate bounce offset for running animation
        let bounceOffset = 0;
        if (!this.jumping && !this.squatting) {
            bounceOffset = Math.sin(this.animationTime * CHARACTER_BOUNCE_SPEED) * CHARACTER_BOUNCE_AMPLITUDE;
        }

        // Save context for rotation
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2 + bounceOffset);
        ctx.rotate(this.rotation * Math.PI / 180);

        // Draw character
        this.drawCharacter(ctx, -this.width/2, -this.height/2);

        // Restore context
        ctx.restore();
    }

    drawCharacter(ctx, x, y) {
        // Create character surface
        const charSurface = document.createElement('canvas');
        charSurface.width = this.width;
        charSurface.height = this.height;
        const charCtx = charSurface.getContext('2d');

        // Adjust proportions when squatting
        const cheeseHeight = this.squatting ? this.height * 0.7 : this.height * 0.55;
        const headScale = this.squatting ? 0.8 : 1.0;

        // Draw cheese block
        charCtx.fillStyle = CHEESE_COLOR;
        charCtx.beginPath();
        charCtx.ellipse(this.width/2, this.height - cheeseHeight/2,
                       this.width/2, cheeseHeight/2, 0, 0, Math.PI * 2);
        charCtx.fill();

        // Add cheese holes
        const holes = [
            {x: this.width * 0.2, y: this.height - cheeseHeight * 0.3},
            {x: this.width * 0.5, y: this.height - cheeseHeight * 0.5},
            {x: this.width * 0.8, y: this.height - cheeseHeight * 0.7},
            {x: this.width * 0.3, y: this.height - cheeseHeight * 0.8},
            {x: this.width * 0.7, y: this.height - cheeseHeight * 0.2}
        ];

        // Draw hole shadows
        charCtx.fillStyle = CHEESE_SHADOW;
        holes.forEach(hole => {
            charCtx.beginPath();
            charCtx.arc(hole.x + 2, hole.y + 2, 5, 0, Math.PI * 2);
            charCtx.fill();
        });

        // Draw holes
        const darkCheese = 'rgb(195, 131, 0)';
        holes.forEach(hole => {
            charCtx.fillStyle = darkCheese;
            charCtx.beginPath();
            charCtx.arc(hole.x, hole.y, 5, 0, Math.PI * 2);
            charCtx.fill();
        });

        // Draw head
        const headSize = this.width * 0.45 * headScale;
        const headX = this.width/2 - headSize/2;
        const headY = this.height - cheeseHeight - headSize * (this.squatting ? 0.5 : 0.8);

        charCtx.fillStyle = SKIN_COLOR;
        charCtx.beginPath();
        charCtx.ellipse(headX + headSize/2, headY + headSize/2,
                       headSize/2, headSize/2, 0, 0, Math.PI * 2);
        charCtx.fill();

        // Add cheeks
        const cheekColor = 'rgba(255, 180, 180, 0.4)';
        const cheekSize = headSize * 0.2;
        charCtx.fillStyle = cheekColor;
        charCtx.beginPath();
        charCtx.ellipse(headX + headSize * 0.25, headY + headSize * 0.6,
                       cheekSize/2, cheekSize/2 * 0.7, 0, 0, Math.PI * 2);
        charCtx.fill();
        charCtx.beginPath();
        charCtx.ellipse(headX + headSize * 0.75, headY + headSize * 0.6,
                       cheekSize/2, cheekSize/2 * 0.7, 0, 0, Math.PI * 2);
        charCtx.fill();

        // Draw eyes
        const eyeSize = headSize * 0.28;
        const eyeY = headY + headSize * 0.35;

        // Eye whites
        charCtx.fillStyle = WHITE;
        charCtx.beginPath();
        charCtx.ellipse(headX + headSize * 0.32, eyeY + eyeSize/2,
                       eyeSize/2, eyeSize/2, 0, 0, Math.PI * 2);
        charCtx.fill();
        charCtx.beginPath();
        charCtx.ellipse(headX + headSize * 0.72, eyeY + eyeSize/2,
                       eyeSize/2, eyeSize/2, 0, 0, Math.PI * 2);
        charCtx.fill();

        // Pupils
        const pupilSize = eyeSize * 0.65;
        const pupilY = eyeY + eyeSize * 0.18;
        const pupilOffset = Math.sin(this.animationTime * 0.1) * 2;

        charCtx.fillStyle = EYE_COLOR;
        charCtx.beginPath();
        charCtx.ellipse(headX + headSize * 0.32 + pupilOffset, pupilY + pupilSize/2,
                       pupilSize * 0.3, pupilSize/2, 0, 0, Math.PI * 2);
        charCtx.fill();
        charCtx.beginPath();
        charCtx.ellipse(headX + headSize * 0.72 + pupilOffset, pupilY + pupilSize/2,
                       pupilSize * 0.3, pupilSize/2, 0, 0, Math.PI * 2);
        charCtx.fill();

        // Draw mouth
        const smileWidth = headSize * 0.5;
        const smileHeight = headSize * 0.3;
        const smileX = headX + headSize * 0.25;
        const smileY = headY + headSize * 0.55;

        charCtx.strokeStyle = MOUTH_COLOR;
        charCtx.lineWidth = 3;
        charCtx.beginPath();
        charCtx.arc(smileX + smileWidth/2, smileY, smileWidth/2, 0, Math.PI);
        charCtx.stroke();

        // Add teeth highlight
        charCtx.strokeStyle = WHITE;
        charCtx.lineWidth = 2;
        charCtx.beginPath();
        charCtx.arc(smileX + smileWidth/2, smileY + smileHeight * 0.1,
                   smileWidth * 0.4, 0, Math.PI);
        charCtx.stroke();

        // Draw spiky hair
        charCtx.fillStyle = HAIR_COLOR;
        const hairHeight = headSize * 0.5;
        const hairPoints = [
            {x: headX + headSize * 0.2, y: headY + headSize * 0.3},
            {x: headX + headSize * 0.1, y: headY + headSize * 0.2},
            {x: headX + headSize * 0.15, y: headY - hairHeight * 0.3},
            {x: headX + headSize * 0.3, y: headY - hairHeight * 0.7},
            {x: headX + headSize * 0.5, y: headY - hairHeight},
            {x: headX + headSize * 0.7, y: headY - hairHeight * 0.7},
            {x: headX + headSize * 0.85, y: headY - hairHeight * 0.3},
            {x: headX + headSize * 0.9, y: headY + headSize * 0.2},
            {x: headX + headSize * 0.8, y: headY + headSize * 0.3}
        ];

        charCtx.beginPath();
        charCtx.moveTo(hairPoints[0].x, hairPoints[0].y);
        hairPoints.forEach(point => charCtx.lineTo(point.x, point.y));
        charCtx.closePath();
        charCtx.fill();

        // Add hair highlights
        charCtx.strokeStyle = 'rgb(255, 120, 50)';
        charCtx.lineWidth = 2;
        charCtx.beginPath();
        charCtx.moveTo(headX + headSize * 0.3, headY - hairHeight * 0.5);
        charCtx.lineTo(headX + headSize * 0.5, headY - hairHeight * 0.8);
        charCtx.lineTo(headX + headSize * 0.7, headY - hairHeight * 0.5);
        charCtx.stroke();

        // Draw the character on the main canvas
        if (this.facingRight) {
            ctx.drawImage(charSurface, x, y);
        } else {
            ctx.scale(-1, 1);
            ctx.drawImage(charSurface, -x - this.width, y);
            ctx.scale(-1, 1);
        }
    }

    moveLeft() {
        this.velX = -PLAYER_SPEED * (this.speedBoost ? SPEED_BOOST_MULTIPLIER : 1);
        if (this.squatting) {
            this.velX *= PLAYER_SQUAT_SPEED / PLAYER_SPEED;
        }
        this.facingRight = false;
    }

    moveRight() {
        this.velX = PLAYER_SPEED * (this.speedBoost ? SPEED_BOOST_MULTIPLIER : 1);
        if (this.squatting) {
            this.velX *= PLAYER_SQUAT_SPEED / PLAYER_SPEED;
        }
        this.facingRight = true;
    }

    stopMoving() {
        this.velX = 0;
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

    squat() {
        if (!this.squatting && !this.jumping) {
            this.squatting = true;
            this.height = PLAYER_SQUAT_HEIGHT;
            this.y = GROUND_HEIGHT - this.height;
            this.state = PLAYER_STATES.SQUATTING;
        }
    }

    stopSquatting() {
        if (this.squatting) {
            this.squatting = false;
            this.height = this.normalHeight;
            this.y = GROUND_HEIGHT - this.height;
            this.state = PLAYER_STATES.IDLE;
        }
    }

    takeDamage() {
        if (this.unlimitedHealth) return;

        if (!this.invulnerable) {
            this.health--;
            this.invulnerable = true;
            this.invulnerableTimer = 60;
            this.state = PLAYER_STATES.HURT;
            this.spawnParticles();
        }
    }

    activatePowerUp(powerType) {
        const currentTime = performance.now();
        if (powerType === 'SPEED') {
            this.speedBoost = true;
            this.speedBoostTimer = currentTime + POWER_UP_DURATION;
        } else if (powerType === 'JUMP') {
            this.jumpBoost = true;
            this.jumpBoostTimer = currentTime + POWER_UP_DURATION;
        }

        this.powerUpMessage = `${powerType} BOOST!`;
        this.messageTimer = MESSAGE_DURATION;
        this.spawnParticles();
        this.spawnParticles();
    }

    spawnParticles() {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            this.particles.push({
                x: this.x + this.width/2,
                y: this.y + this.height/2,
                velX: Math.cos(angle) * speed,
                velY: Math.sin(angle) * speed,
                color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
                lifetime: PARTICLE_LIFETIME
            });
        }
    }

    shootLaser() {
        const currentTime = performance.now();
        if (currentTime - this.lastShotTime >= LASER_COOLDOWN) {
            const laserX = this.x + (this.facingRight ? this.width : 0);
            const laserY = this.y + this.height/2;
            this.lasers.push(new Laser(laserX, laserY, this.facingRight));
            this.lastShotTime = currentTime;
        }
    }

    checkPlatformCollision(platform) {
        if (this.y + this.height >= platform.y &&
            this.y + this.height <= platform.y + platform.height &&
            this.x + this.width > platform.x &&
            this.x < platform.x + platform.width) {
            this.y = platform.y - this.height;
            this.velY = 0;
            this.jumping = false;
            return true;
        }
        return false;
    }

    checkObstacleCollision(obstacle) {
        if (this.x + this.width > obstacle.x &&
            this.x < obstacle.x + obstacle.width &&
            this.y + this.height > obstacle.y &&
            this.y < obstacle.y + obstacle.height) {
            this.takeDamage();
            return true;
        }
        return false;
    }

    checkCatCollision(cat) {
        if (this.x + this.width > cat.x &&
            this.x < cat.x + cat.width &&
            this.y + this.height > cat.y &&
            this.y < cat.y + cat.height) {
            this.takeDamage();
            return true;
        }
        return false;
    }

    checkCheeseballCollision(ball) {
        return this.x + this.width > ball.x &&
               this.x < ball.x + ball.size &&
               this.y + this.height > ball.y &&
               this.y < ball.y + ball.size;
    }
} 