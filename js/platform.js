class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(ctx) {
        // Draw platform with a slight 3D effect
        ctx.fillStyle = '#8B4513'; // Dark brown
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Top highlight
        ctx.fillStyle = '#DEB887'; // Light brown
        ctx.fillRect(this.x, this.y, this.width, 5);
    }
} 