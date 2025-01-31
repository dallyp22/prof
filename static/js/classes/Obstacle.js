class Obstacle {
    constructor(x, y, type) {
        this.type = OBSTACLE_TYPES[type];
        this.x = x;
        this.y = y;
        this.width = this.type.width;
        this.height = this.type.height;
        this.damage = this.type.damage;
        
        if (type === 'DRONE') {
            this.originalY = y;
            this.movement = 0;
            this.facingLeft = true;
        }
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
        
        if (this.originalY !== undefined) {  // Is a drone
            this.movement += 0.05;
            this.y = this.originalY + Math.sin(this.movement) * 50;
            // Update facing direction based on vertical movement
            this.facingLeft = Math.cos(this.movement) <= 0;
        }
    }

    draw(ctx) {
        if (window.game && window.game.dalbirdImage) {
            // Draw the dalbird image
            const image = window.game.dalbirdImage;
            if (this.facingLeft) {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(image, -this.x - this.width, this.y, this.width, this.height);
                ctx.restore();
            } else {
                ctx.drawImage(image, this.x, this.y, this.width, this.height);
            }
        } else {
            // Fallback to original red rectangle
            ctx.fillStyle = HAZARD_COLOR;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
} 