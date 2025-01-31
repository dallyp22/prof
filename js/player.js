class Player {
    constructor(game) {
        this.game = game;
        this.width = 50;
        this.height = 50;
        this.x = 50;
        this.y = game.canvas.height - this.height - 10;
        this.baseSpeed = 3; // Base forward speed
        this.maxSpeed = 7;  // Maximum speed
        this.minSpeed = 1;  // Minimum speed
        this.currentSpeed = this.baseSpeed;
        this.jumpForce = -15;
        this.gravity = 0.8;
        this.velocityY = 0;
        this.isJumping = false;
        this.lastShot = 0;
        this.health = 100;
    }

    update() {
        // Always move forward
        this.x += this.currentSpeed;

        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Ground collision
        if (this.y > this.game.canvas.height - this.height - 10) {
            this.y = this.game.canvas.height - this.height - 10;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Keep player in bounds and wrap around when reaching right edge
        if (this.x < 0) {
            this.x = 0;
            this.currentSpeed = Math.max(this.currentSpeed, this.baseSpeed);
        }
        if (this.x + this.width > this.game.canvas.width) {
            this.x = 0; // Wrap around to left side
            this.game.score += 5; // Bonus points for completing a lap
        }

        // Gradually return to base speed
        if (this.currentSpeed > this.baseSpeed) {
            this.currentSpeed = Math.max(this.baseSpeed, this.currentSpeed - 0.1);
        } else if (this.currentSpeed < this.baseSpeed) {
            this.currentSpeed = Math.min(this.baseSpeed, this.currentSpeed + 0.1);
        }
    }

    // Modify speed based on player input
    modifySpeed(direction) {
        if (direction === 'right') {
            this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + 0.5);
        } else if (direction === 'left') {
            this.currentSpeed = Math.max(this.minSpeed, this.currentSpeed - 0.5);
        }
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > 500) { // Cooldown of 500ms
            this.game.lasers.push(new Laser(this.x + this.width, this.y + this.height/2));
            this.lastShot = now;
        }
    }

    render(ctx) {
        if (AssetLoader.images.ryan) {
            ctx.drawImage(AssetLoader.images.ryan, this.x, this.y, this.width, this.height);
        }

        // Draw health bar
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 10, healthBarWidth, healthBarHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 10, (this.health/100) * healthBarWidth, healthBarHeight);
    }
}

class Laser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 5;
        this.speed = 10;
    }

    update() {
        this.x += this.speed;
    }

    render(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
} 