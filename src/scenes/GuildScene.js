/* START OF FILE */
class GuildScene extends Phaser.Scene {
    constructor() {
        super('GuildScene');
    }

    preload() {
        // Explicitly load the sprite sheet in this scene to ensure it's available
        this.load.spritesheet('Characters', 'assets/Sprites.png', {
            frameWidth: 600,
            frameHeight: 900,
            startFrame: 0,
            endFrame: 1
        });
    }

    create() {
        // Get the center coordinates of the game
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Log available textures to debug
        console.log('Available textures:', this.textures.list);

        // Create the first sprite (hooded figure) on the left
        // Using frame index 0 for the first sprite
        const hoodedFigure = this.add.sprite(centerX - 150, centerY, 'Characters', 0);

        // Create the second sprite (sword holder) on the right
        // Using frame index 1 for the second sprite
        const swordHolder = this.add.sprite(centerX + 150, centerY, 'Characters', 1);

        // Scale down the sprites if needed (since they're 600x900)
        hoodedFigure.setScale(0.3);
        swordHolder.setScale(0.3);

        // Add some basic interactivity
        [hoodedFigure, swordHolder].forEach(sprite => {
            sprite.setInteractive();

            // Add hover effect
            sprite.on('pointerover', () => {
                sprite.setScale(0.33); // Slightly larger on hover
            });

            sprite.on('pointerout', () => {
                sprite.setScale(0.3); // Back to normal size
            });

            // Add click effect (bounce)
            sprite.on('pointerdown', () => {
                this.tweens.add({
                    targets: sprite,
                    y: sprite.y - 20,
                    duration: 100,
                    yoyo: true,
                    ease: 'Bounce'
                });
            });
        });
    }
}

export default GuildScene; 
