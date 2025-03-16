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

        // Get screen width for full movement
        const screenWidth = this.cameras.main.width;

        // Create the first sprite (thief) on the left
        const thief = this.add.sprite(screenWidth - 100, centerY, 'Characters', 0);
        thief.setScale(0.3);

        // Create the second sprite (guard) on the right
        const guard = this.add.sprite(1000, centerY, 'Characters', 1);
        guard.setScale(0.3);

        // Set up walking for thief - moving left first, across the entire screen
        this.setupWalkingSimple(thief, screenWidth - 100, 100, centerY, 6000);

        // Set up walking for guard - moving left first
        this.setupWalkingSimple(guard, 1000, 700, centerY, 4000);

        // Add wobble to both characters
        this.startWobble(thief, 10, 300);
        this.startWobble(guard, 8, 400);

        // Make sprites interactive
        [thief, guard].forEach(sprite => {
            sprite.setInteractive();
            sprite.on('pointerdown', () => {
                // Jump when clicked
                this.tweens.add({
                    targets: sprite,
                    y: sprite.y - 50,
                    duration: 300,
                    yoyo: true,
                    ease: 'Sine.easeOut'
                });
            });
        });
    }

    setupWalkingSimple(sprite, x1, x2, y, duration) {
        // Set initial position
        sprite.x = x1;
        sprite.y = y;

        // Create a direct tween that goes back and forth
        this.tweens.add({
            targets: sprite,
            x: x2,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Linear',
            onYoyo: () => {
                sprite.setFlipX(true);
            },
            onRepeat: () => {
                sprite.setFlipX(false);
            },
            onStart: () => {
                sprite.setFlipX(false);
            }
        });
    }

    startWobble(sprite, amount, duration) {
        // Create a wobble effect while walking
        this.tweens.add({
            targets: sprite,
            scaleX: { from: 0.3, to: 0.32 },
            scaleY: { from: 0.3, to: 0.28 },
            y: { from: sprite.y, to: sprite.y + amount },
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}

export default GuildScene; 
