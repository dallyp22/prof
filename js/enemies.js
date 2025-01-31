class Enemy {
    constructor(game, x, y, width, height, speed) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    update() {
        this.x -= this.speed;
    }

    render(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class DalBird extends Enemy {
    constructor(game) {
        const width = 40;
        const height = 40;
        super(game, 
            game.canvas.width, 
            Math.random() * (game.canvas.height - height), 
            width, 
            height, 
            3);
    }

    render(ctx) {
        if (AssetLoader.images.dalbird) {
            ctx.drawImage(AssetLoader.images.dalbird, this.x, this.y, this.width, this.height);
        }
    }
}

class Catlock extends Enemy {
    constructor(game) {
        const width = 60;
        const height = 60;
        super(game,
            game.canvas.width,
            game.canvas.height - height - 10,
            width,
            height,
            2);
        this.jumpForce = -12;
        this.gravity = 0.5;
        this.velocityY = 0;
        this.isJumping = false;
        this.jumpTimer = 0;
    }

    update() {
        super.update();
        
        // Jump periodically
        this.jumpTimer++;
        if (this.jumpTimer > 120) { // Jump every 2 seconds (60fps * 2)
            this.jump();
            this.jumpTimer = 0;
        }

        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Ground collision
        if (this.y > this.game.canvas.height - this.height - 10) {
            this.y = this.game.canvas.height - this.height - 10;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }
    }

    render(ctx) {
        if (AssetLoader.images.catlock) {
            ctx.drawImage(AssetLoader.images.catlock, this.x, this.y, this.width, this.height);
        }
    }
}

class CatlockBoss extends Enemy {
    constructor(game) {
        const width = 80;
        const height = 80;
        super(game, 
            game.canvas.width, 
            game.canvas.height/2 - height/2, 
            width, 
            height, 
            2);
        this.health = 100;
        this.movePattern = 0;
        this.moveTimer = 0;
    }

    update() {
        super.update();
        
        // Sinusoidal movement
        this.moveTimer += 0.05;
        this.y += Math.sin(this.moveTimer) * 2;
        
        // Keep in bounds
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > this.game.canvas.height) {
            this.y = this.game.canvas.height - this.height;
        }
    }

    render(ctx) {
        if (AssetLoader.images.catlock) {
            ctx.drawImage(AssetLoader.images.catlock, this.x, this.y, this.width, this.height);
        }
        
        // Health bar
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 10, healthBarWidth, healthBarHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 10, (this.health/100) * healthBarWidth, healthBarHeight);
    }
} 