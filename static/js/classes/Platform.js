class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = PLATFORM_HEIGHT;
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
    }

    draw(ctx, color) {
        // Draw main platform
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Add a darker shade at the bottom for depth
        const darkerShade = this.getDarkerShade(color);
        ctx.fillStyle = darkerShade;
        ctx.fillRect(this.x, this.y + this.height - 4, this.width, 4);
    }

    getDarkerShade(color) {
        // Parse RGB values from the color string
        const rgb = color.match(/\d+/g).map(Number);
        // Make each component darker by subtracting 40
        const darker = rgb.map(c => Math.max(0, c - 40));
        return `rgb(${darker[0]}, ${darker[1]}, ${darker[2]})`;
    }
} 