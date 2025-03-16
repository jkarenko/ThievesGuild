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
        const guard = this.add.sprite(screenWidth - 200, centerY, 'Characters', 1);
        guard.setScale(0.3);

        // Set up walking for thief - moving left first, across the entire screen
        this.setupWalkingSimple(thief, screenWidth - 100, 100, centerY, 6000);

        // Make the guard follow the thief with a delay
        this.setupFollowing(guard, thief, 100, 0.3);

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

    setupFollowing(follower, target, distance, speed) {
        // Store the target and follower in properties
        follower.followTarget = target;
        follower.followDistance = distance;

        // Create a reference to the scene for use in callbacks
        const scene = this;

        // Create a tween that will be updated/restarted when target changes direction
        let followTween = null;

        // Track the target's direction
        let lastDirection = 0;

        // Track the follower's last position to determine movement direction
        let lastX = follower.x;

        // Update function to check target position and adjust follower
        this.time.addEvent({
            delay: 100,
            callback: function () {
                // Get target's current position and calculate direction
                const targetX = target.x;
                const currentDirection = target.flipX ? -1 : 1;

                // If direction changed or no tween exists, create a new follow tween
                if (currentDirection !== lastDirection || !followTween || !followTween.isPlaying()) {
                    // Stop existing tween if it exists
                    if (followTween) {
                        followTween.stop();
                    }

                    // Calculate destination based on target's direction
                    const destinationX = targetX - (distance * currentDirection);

                    // Determine if guard will move right
                    const movingRight = destinationX > follower.x;

                    // Set flip based on movement direction - only flip when moving right
                    follower.setFlipX(movingRight);

                    // Create new tween to smoothly move to the new position
                    followTween = scene.tweens.add({
                        targets: follower,
                        x: destinationX,
                        duration: 1000,
                        ease: 'Linear'
                    });

                    // Update last known direction
                    lastDirection = currentDirection;
                }
            },
            callbackScope: this,
            loop: true
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
