class Cat {
    constructor(x, y) {
        this.width = CAT_WIDTH;
        this.height = CAT_HEIGHT;
        this.x = x;
        this.y = y;
        this.velX = -CAT_SPEED;
        this.velY = 0;
        this.state = 'chase';
        this.animationTime = 0;
        this.lastJump = 0;
        this.angry = false;
        this.message = "";
        this.messageTimer = 0;
        this.lastTaunt = 0;
        this.frameIndex = 0;
        this.frameDelay = 3;
        this.frameCounter = 0;
    }

    update(player, platforms) {
        this.animationTime++;
        
        // Update message timer
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
        }

        // Platform collisions
        for (const platform of platforms) {
            if (this.y + this.height >= platform.y && 
                this.y + this.height <= platform.y + platform.height &&
                this.x + this.width > platform.x && 
                this.x < platform.x + platform.width) {
                this.y = platform.y - this.height;
                this.velY = 0;
            }
        }

        // Chase player behavior
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < CAT_DETECTION_RANGE) {
            this.angry = true;
            // Accelerate towards player
            if (dx > 0) {
                this.velX += CAT_ACCELERATION;
            } else {
                this.velX -= CAT_ACCELERATION;
            }
            
            // Maybe taunt the player
            const currentTime = performance.now();
            if (currentTime - this.lastTaunt > MESSAGE_DURATION * 2) {  // Don't spam messages
                if (Math.random() < 0.02) {  // 2% chance each frame when in range
                    this.message = CAT_TAUNTS[Math.floor(Math.random() * CAT_TAUNTS.length)];
                    this.messageTimer = MESSAGE_DURATION;
                    this.lastTaunt = currentTime;
                }
            }
            
            // Jump if player is above
            if (dy < -50 && currentTime - this.lastJump > 1000) {  // Jump cooldown
                this.velY = CAT_JUMP_POWER;
                this.lastJump = currentTime;
            }
        } else {
            this.angry = false;
            this.velX = -CAT_SPEED;
        }

        // Limit maximum speed
        this.velX = Math.max(-CAT_SPEED * 2, Math.min(CAT_SPEED * 2, this.velX));
        
        // Update position
        this.x += this.velX;

        // Update animation frame
        this.frameCounter++;
        if (this.frameCounter >= this.frameDelay) {
            this.frameCounter = 0;
            if (window.game && window.game.catlockFrames) {
                this.frameIndex = (this.frameIndex + 1) % window.game.catlockFrames.length;
            }
        }
    }

    draw(ctx) {
        // Draw the cat message if active
        if (this.messageTimer > 0) {
            ctx.font = '24px Arial';
            ctx.fillStyle = WHITE;
            ctx.textAlign = 'center';
            ctx.fillText(this.message, this.x + this.width/2, this.y - 10);
        }

        if (window.game && window.game.catlockFrames) {
            // Draw the current frame of the GIF
            const image = window.game.catlockFrames[this.frameIndex];
            if (this.velX > 0) {  // Flip if moving right
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(image, -this.x - this.width, this.y);
                ctx.restore();
            } else {
                ctx.drawImage(image, this.x, this.y);
            }
        } else {
            // Create surface for the cat
            const catSurface = document.createElement('canvas');
            catSurface.width = this.width;
            catSurface.height = this.height;
            const catCtx = catSurface.getContext('2d');
            
            // Body (oval shape)
            const bodyRect = {
                x: 0,
                y: this.height * 0.2,
                width: this.width * 0.8,
                height: this.height * 0.6
            };
            catCtx.fillStyle = CAT_COLORS.BODY;
            catCtx.beginPath();
            catCtx.ellipse(bodyRect.x + bodyRect.width/2, bodyRect.y + bodyRect.height/2,
                          bodyRect.width/2, bodyRect.height/2, 0, 0, Math.PI * 2);
            catCtx.fill();
            
            // Stripes
            const stripeCount = 3;
            const stripeWidth = bodyRect.width / (stripeCount * 2);
            for (let i = 0; i < stripeCount; i++) {
                const x = bodyRect.x + bodyRect.width * (i + 0.5) / stripeCount;
                catCtx.fillStyle = CAT_COLORS.DARK_STRIPES;
                catCtx.beginPath();
                catCtx.ellipse(x, bodyRect.y + bodyRect.height/2,
                              stripeWidth/2, bodyRect.height/2, 0, 0, Math.PI * 2);
                catCtx.fill();
            }
            
            // Head
            const headSize = this.height * 0.5;
            const headX = this.width * 0.6;
            const headY = this.height * 0.1;
            catCtx.fillStyle = CAT_COLORS.BODY;
            catCtx.beginPath();
            catCtx.ellipse(headX + headSize/2, headY + headSize/2,
                          headSize/2, headSize/2, 0, 0, Math.PI * 2);
            catCtx.fill();
            
            // Eyes
            const eyeSize = headSize * 0.3;
            const eyeSpacing = eyeSize * 0.8;
            const eyeY = headY + headSize * 0.3;
            
            // Left eye
            catCtx.fillStyle = CAT_COLORS.EYE_COLOR;
            catCtx.beginPath();
            catCtx.ellipse(headX + headSize * 0.2 + eyeSize/2, eyeY + eyeSize/2,
                          eyeSize/2, eyeSize/2, 0, 0, Math.PI * 2);
            catCtx.fill();
            
            // Right eye
            catCtx.beginPath();
            catCtx.ellipse(headX + headSize * 0.2 + eyeSpacing + eyeSize/2, eyeY + eyeSize/2,
                          eyeSize/2, eyeSize/2, 0, 0, Math.PI * 2);
            catCtx.fill();
            
            // Pupils
            const pupilWidth = eyeSize * (this.angry ? 0.2 : 0.4);
            const pupilHeight = eyeSize * 0.7;
            const pupilOffset = Math.sin(this.animationTime * 0.1) * 2;
            
            catCtx.fillStyle = CAT_COLORS.PUPIL_COLOR;
            // Left pupil
            catCtx.beginPath();
            catCtx.ellipse(headX + headSize * 0.2 + eyeSize/2 + pupilOffset, eyeY + eyeSize * 0.65,
                          pupilWidth/2, pupilHeight/2, 0, 0, Math.PI * 2);
            catCtx.fill();
            // Right pupil
            catCtx.beginPath();
            catCtx.ellipse(headX + headSize * 0.2 + eyeSpacing + eyeSize/2 + pupilOffset,
                          eyeY + eyeSize * 0.65, pupilWidth/2, pupilHeight/2, 0, 0, Math.PI * 2);
            catCtx.fill();
            
            // Nose
            const noseSize = headSize * 0.15;
            catCtx.fillStyle = CAT_COLORS.NOSE;
            catCtx.beginPath();
            catCtx.ellipse(headX + headSize * 0.5, headY + headSize * 0.5,
                          noseSize/2, noseSize * 0.4, 0, 0, Math.PI * 2);
            catCtx.fill();
            
            // Mouth
            if (this.angry) {
                // Angry mouth with teeth
                const mouthPoints = [
                    [headX + headSize * 0.3, headY + headSize * 0.65],
                    [headX + headSize * 0.5, headY + headSize * 0.75],
                    [headX + headSize * 0.7, headY + headSize * 0.65]
                ];
                catCtx.strokeStyle = CAT_COLORS.MOUTH;
                catCtx.lineWidth = 2;
                catCtx.beginPath();
                catCtx.moveTo(mouthPoints[0][0], mouthPoints[0][1]);
                catCtx.lineTo(mouthPoints[1][0], mouthPoints[1][1]);
                catCtx.lineTo(mouthPoints[2][0], mouthPoints[2][1]);
                catCtx.stroke();
                
                // Add teeth
                const toothSize = headSize * 0.1;
                catCtx.fillStyle = WHITE;
                catCtx.beginPath();
                catCtx.moveTo(mouthPoints[0][0], mouthPoints[0][1]);
                catCtx.lineTo(mouthPoints[0][0] + toothSize, mouthPoints[0][1] + toothSize);
                catCtx.lineTo(mouthPoints[0][0] + toothSize * 2, mouthPoints[0][1]);
                catCtx.fill();
                catCtx.beginPath();
                catCtx.moveTo(mouthPoints[2][0], mouthPoints[2][1]);
                catCtx.lineTo(mouthPoints[2][0] - toothSize, mouthPoints[2][1] + toothSize);
                catCtx.lineTo(mouthPoints[2][0] - toothSize * 2, mouthPoints[2][1]);
                catCtx.fill();
            } else {
                // Normal mouth
                const mouthWidth = headSize * 0.4;
                const mouthHeight = headSize * 0.2;
                catCtx.strokeStyle = CAT_COLORS.MOUTH;
                catCtx.lineWidth = 2;
                catCtx.beginPath();
                catCtx.arc(headX + headSize * 0.5, headY + headSize * 0.7,
                          mouthWidth/2, 0, Math.PI);
                catCtx.stroke();
            }
            
            // Ears
            const earWidth = headSize * 0.4;
            const earHeight = headSize * 0.4;
            catCtx.fillStyle = CAT_COLORS.BODY;
            // Left ear
            catCtx.beginPath();
            catCtx.moveTo(headX + headSize * 0.2, headY);
            catCtx.lineTo(headX + headSize * 0.1, headY - earHeight);
            catCtx.lineTo(headX + headSize * 0.4, headY);
            catCtx.fill();
            // Right ear
            catCtx.beginPath();
            catCtx.moveTo(headX + headSize * 0.6, headY);
            catCtx.lineTo(headX + headSize * 0.9, headY - earHeight);
            catCtx.lineTo(headX + headSize * 0.8, headY);
            catCtx.fill();

            // Draw the cat on screen
            if (this.velX > 0) {  // Flip if moving right
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(catSurface, -this.x - this.width, this.y);
                ctx.restore();
            } else {
                ctx.drawImage(catSurface, this.x, this.y);
            }
        }
    }
} 