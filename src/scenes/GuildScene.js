/* START OF FILE */
class GuildScene extends Phaser.Scene {
    constructor() {
        super('GuildScene');
    }

    create() {
        // Get the center coordinates of the game
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Create the first sprite (hooded figure) on the left
        const hoodedFigure = this.add.sprite(centerX - 100, centerY, 'Sprites', 'thief');

        // Create the second sprite (sword holder) on the right
        const swordHolder = this.add.sprite(centerX + 100, centerY, 'Sprites', 'guard');

        // Add some basic interactivity
        [hoodedFigure, swordHolder].forEach(sprite => {
            sprite.setInteractive();

            // Add hover effect
            sprite.on('pointerover', () => {
                sprite.setScale(1.1);
            });

            sprite.on('pointerout', () => {
                sprite.setScale(1);
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
