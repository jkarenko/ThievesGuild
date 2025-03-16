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
        thief.setOrigin(0.5, 1.0);
        thief.setDepth(1); // Set z-value so that thief is on top

        // Create the second sprite (guard) on the right
        const guard = this.add.sprite(screenWidth - 200, centerY + 100, 'Characters', 1);
        guard.setScale(0.3);
        guard.setOrigin(0.5, 1.0);
        guard.setDepth(0); // Set z-value for guard to be below thief

        // Set up walking for thief - moving left first, across the entire screen
        this.setupWalkingSimple(thief, screenWidth - 100, 100, centerY + 100, 6000);

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
                sprite.setFlipX(true); // Flip when moving right
            },
            onRepeat: () => {
                sprite.setFlipX(false); // Reset to default left-facing when moving left
            },
            onStart: () => {
                sprite.setFlipX(false); // Start with default left-facing
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

        // Flag to track if an attack is in progress
        let attackInProgress = false;

        // Update function to check target position and adjust follower
        this.time.addEvent({
            delay: 100,
            callback: function () {
                // Get target's current position and calculate direction
                const targetX = target.x;
                const currentDirection = target.flipX ? -1 : 1; // -1 when facing right, 1 when facing left (default)

                // Calculate distance to target
                const distanceToTarget = Math.abs(targetX - follower.x);

                // Check if close enough to attack and not already attacking
                if (distanceToTarget <= distance + 20 && !attackInProgress) {
                    attackInProgress = true;

                    // Pause wobble animation if it exists
                    if (follower.wobbleTween) {
                        follower.wobbleTween.pause();
                    }

                    // Execute attack animation
                    scene.performAttack(follower, target, () => {
                        // Reset attack flag when animation completes
                        attackInProgress = false;

                        // Resume wobble animation if it exists
                        if (follower.wobbleTween) {
                            follower.wobbleTween.resume();
                        }
                    });

                    // Skip movement update during attack
                    return;
                }

                // Skip movement updates if attack is in progress
                if (attackInProgress) {
                    return;
                }

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

                    // Set flip based on movement direction - flip when moving right, default left-facing otherwise
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

    performAttack(attacker, target, onComplete) {
        // Reset to default scale before starting attack animation
        attacker.setScale(0.3);

        // Save original properties
        const originalScaleX = 0.3;
        const originalScaleY = 0.3;

        // Sprites face left by default
        // When not flipped (facing left): Positive rotation = backward, Negative rotation = forward
        // When flipped (facing right): Negative rotation = backward, Positive rotation = forward
        const isFlipped = attacker.flipX;

        // Wind up animation (bend backward)
        this.tweens.add({
            targets: attacker,
            rotation: isFlipped ? -0.2 : 0.2, // Rotate backward based on direction
            scaleX: originalScaleX * 0.9,
            scaleY: originalScaleY * 1.1,
            duration: 200,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Attack animation (bend forward quickly)
                this.tweens.add({
                    targets: attacker,
                    rotation: isFlipped ? 0.3 : -0.3, // Rotate forward based on direction
                    scaleX: originalScaleX * 1.1,
                    scaleY: originalScaleY * 0.9,
                    duration: 50,
                    ease: 'Power2.easeIn',
                    onComplete: () => {
                        // Make target react (small jump and flash)
                        this.tweens.add({
                            targets: target,
                            y: target.y - 30,
                            tint: 0xff0000, // Flash red
                            duration: 50,
                            yoyo: true,
                            duration: 100,
                            yoyo: true,
                            ease: 'Power1.easeOut',
                            onComplete: () => {
                                // Reset attacker to original state
                                this.tweens.add({
                                    targets: attacker,
                                    rotation: 0,
                                    scaleX: originalScaleX,
                                    scaleY: originalScaleY,
                                    duration: 200,
                                    ease: 'Sine.easeOut',
                                    onComplete: onComplete
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    startWobble(sprite, amount, duration) {
        // Create a wobble effect while walking
        sprite.wobbleTween = this.tweens.add({
            targets: sprite,
            scaleX: { from: 0.3, to: 0.32 },
            scaleY: { from: 0.3, to: 0.28 },
            y: { from: sprite.y, to: sprite.y + amount },
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Store reference to the tween on the sprite
        return sprite.wobbleTween;
    }
}

export default GuildScene; 
