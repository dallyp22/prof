class Cheeseball {
    constructor(x, y, powerType) {
        this.x = x;
        this.y = y;
        this.size = CHEESEBALL_SIZE;
        this.type = powerType;
        this.color = CHEESEBALL_COLORS[powerType];
        this.animationTime = 0;
        this.collected = false;
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
        this.animationTime += 1;
    }

    draw(ctx) {
        // Draw glow effect
        const glowSize = this.size * (1.2 + Math.sin(this.animationTime * 0.1) * 0.2);
        ctx.fillStyle = CHEESEBALL_GLOW;
        ctx.beginPath();
        ctx.arc(this.x + this.size/2, this.y + this.size/2, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw cheeseball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add shine
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(this.x + this.size * 0.7, this.y + this.size * 0.3, this.size/4, 0, Math.PI * 2);
        ctx.fill();
    }
} 