const AssetLoader = {
    images: {},
    sounds: {},
    totalAssets: 0,
    loadedAssets: 0,

    loadAll(callback) {
        const imageFiles = {
            ryan: 'Ryan.PNG',
            dalbird: 'dalbird.PNG',
            catlock: 'Catlock2.gif',
            villain: 'villain.png'
        };

        this.totalAssets = Object.keys(imageFiles).length;

        Object.entries(imageFiles).forEach(([key, path]) => {
            const img = new Image();
            img.onload = () => {
                this.loadedAssets++;
                if (this.loadedAssets === this.totalAssets) {
                    callback();
                }
            };
            img.src = path;
            this.images[key] = img;
        });
    },

    // Helper method to check if all assets are loaded
    isReady() {
        return this.loadedAssets === this.totalAssets;
    }
}; 