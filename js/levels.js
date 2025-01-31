const LevelManager = {
    levels: [
        {
            message: "Welcome to Ryan's Adventure! Use arrow keys to move, SPACE to jump, and X to shoot!",
            enemySpawnRate: 0.02,
            enemyTypes: ['dalbird', 'catlock']
        },
        {
            message: "Things are getting tougher!",
            enemySpawnRate: 0.03,
            enemyTypes: ['dalbird', 'catlock']
        },
        {
            message: "BOSS LEVEL: Here comes Mega Catlock!",
            enemySpawnRate: 0,
            isBossLevel: true
        }
    ],

    getCurrentLevel(levelNum) {
        return this.levels[levelNum - 1];
    },

    createPlatforms(game) {
        const platforms = [];
        
        // Create different platform layouts for each level
        switch(game.level) {
            case 1:
                platforms.push(
                    new Platform(300, 300, 200, 20),
                    new Platform(100, 200, 200, 20),
                    new Platform(500, 200, 200, 20)
                );
                break;
            case 2:
                platforms.push(
                    new Platform(200, 250, 150, 20),
                    new Platform(450, 250, 150, 20),
                    new Platform(325, 150, 150, 20)
                );
                break;
            case 3:
                platforms.push(
                    new Platform(150, 300, 100, 20),
                    new Platform(350, 250, 100, 20),
                    new Platform(550, 200, 100, 20),
                    new Platform(350, 150, 100, 20)
                );
                break;
        }
        
        return platforms;
    },

    spawnEnemies(game) {
        const currentLevel = this.getCurrentLevel(game.level);
        
        if (currentLevel.isBossLevel && game.enemies.length === 0) {
            game.enemies.push(new CatlockBoss(game));
            return;
        }

        if (Math.random() < currentLevel.enemySpawnRate) {
            const enemyType = currentLevel.enemyTypes[
                Math.floor(Math.random() * currentLevel.enemyTypes.length)
            ];
            
            switch(enemyType) {
                case 'dalbird':
                    game.enemies.push(new DalBird(game));
                    break;
                case 'catlock':
                    game.enemies.push(new Catlock(game));
                    break;
            }
        }
    },

    drawBackground(ctx, level) {
        // Simple gradient background that changes with levels
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        switch(level) {
            case 1:
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#E0F6FF');
                break;
            case 2:
                gradient.addColorStop(0, '#FF7F50');
                gradient.addColorStop(1, '#FFD700');
                break;
            case 3:
                gradient.addColorStop(0, '#4B0082');
                gradient.addColorStop(1, '#800080');
                break;
            default:
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#E0F6FF');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}; 