class Laser {
    constructor(x, y, facingRight = true) {
        this.x = x;
        this.y = y;
        this.width = LASER_WIDTH;
        this.height = LASER_HEIGHT;
        this.speed = facingRight ? LASER_SPEED : -LASER_SPEED;
        this.active = true;
    }

    update() {
        this.x += this.speed;
    }

    draw(ctx) {
        // Draw glow effect
        ctx.fillStyle = LASER_GLOW;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2,
                   this.width, this.height * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw laser beam
        ctx.fillStyle = LASER_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    checkCollision(target) {
        return this.x + this.width > target.x &&
               this.x < target.x + target.width &&
               this.y + this.height > target.y &&
               this.y < target.y + target.height;
    }
} 