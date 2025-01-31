class Cheeseball {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.collected = false;
        this.bobTimer = 0;
    }

    update() {
        // Make the cheeseball bob up and down
        this.bobTimer += 0.05;
        this.y += Math.sin(this.bobTimer) * 0.5;
    }

    render(ctx) {
        // Draw a glowing yellow circle for the cheeseball
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 0,
            this.x + this.width/2, this.y + this.height/2, this.width/2
        );
        gradient.addColorStop(0, '#FFD700');  // Gold center
        gradient.addColorStop(1, '#FFA500');  // Orange edge
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add shine effect
        ctx.beginPath();
        ctx.arc(this.x + this.width/3, this.y + this.height/3, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
    }
} 