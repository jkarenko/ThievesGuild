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

        // Load audio sprite sheet
        this.load.audioSprite('sfx', 'assets/audio/audioSprite.json', [
            'assets/audio/audioSprite.ogg',
            'assets/audio/audioSprite.mp3'
        ]);
    }

    create() {
        // Get the center coordinates of the game
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Get screen width for full movement
        const screenWidth = this.cameras.main.width;
        // Get screen height for boundary checking
        const screenHeight = this.cameras.main.height;

        // Create the first sprite (thief) on the left
        const thief = this.add.sprite(screenWidth - 100, centerY, 'Characters', 0);
        thief.setScale(0.3);
        thief.setOrigin(0.5, 1.0);
        thief.setDepth(1); // Set z-value so that thief is on top
        thief.setName('thief'); // Give the thief a name for reference

        // Create the second sprite (guard) on the right
        const guard = this.add.sprite(screenWidth - 200, centerY + 100, 'Characters', 1);
        guard.setScale(0.3);
        guard.setOrigin(0.5, 1.0);
        guard.setDepth(0); // Set z-value for guard to be below thief
        guard.setName('guard'); // Give the guard a name for reference

        // Initialize guard's originalY for wobble and Y-following
        guard.originalY = centerY + 100;

        // Set up walking for thief - moving left first, across the entire screen
        this.setupWalkingSimple(thief, screenWidth - 100, 100, centerY + 100, 6000, screenHeight);

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

                // Play coin sound when thief is clicked
                if (sprite.texture.key === 'Characters' && sprite.frame.name === 0) {
                    this.playRandomCoin();
                }
            });
        });
    }

    setupWalkingSimple(sprite, x1, x2, y, duration, screenHeight) {
        // Set initial position
        sprite.x = x1;
        sprite.y = y;

        // Initialize Y velocity property
        sprite.yVelocity = 0;

        // Store original Y position for wobble calculations
        sprite.originalY = y;

        // Store screen height for boundary checking
        sprite.screenHeight = screenHeight;

        // Set top and bottom boundaries (accounting for sprite height and origin)
        const spriteHeight = sprite.height * sprite.scaleY;
        sprite.topBoundary = spriteHeight * sprite.originY; // Minimum Y position
        sprite.bottomBoundary = screenHeight - (spriteHeight * (1 - sprite.originY)); // Maximum Y position

        // Create a direct tween that goes back and forth
        this.tweens.add({
            targets: sprite,
            x: x2,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Linear',
            onYoyo: () => {
                this.flipSprite(sprite, true); // Flip with animation when moving right
                this.setRandomYVelocity(sprite); // Set random Y velocity when hitting right wall
            },
            onRepeat: () => {
                this.flipSprite(sprite, false); // Flip with animation when moving left
                this.setRandomYVelocity(sprite); // Set random Y velocity when hitting left wall
            },
            onStart: () => {
                sprite.setFlipX(false); // Start with default left-facing
            }
        });

        // Add update event for Y movement and boundary checking
        this.time.addEvent({
            delay: 16, // ~60fps
            callback: () => this.updateYPosition(sprite),
            callbackScope: this,
            loop: true
        });
    }

    setRandomYVelocity(sprite) {
        // Generate random Y velocity between -2 and 2
        sprite.yVelocity = Phaser.Math.FloatBetween(-2, 2);
    }

    updateYPosition(sprite) {
        if (!sprite.active) return;

        // For thief: apply Y velocity to sprite's base position
        if (sprite.yVelocity !== undefined) {
            sprite.originalY += sprite.yVelocity;

            // Calculate actual Y position (wobble tween will offset from this)
            const actualY = sprite.originalY;

            // Check boundaries
            if (actualY <= sprite.topBoundary) {
                sprite.originalY = sprite.topBoundary;
                sprite.yVelocity *= -1; // Invert velocity when hitting top
            } else if (actualY >= sprite.bottomBoundary) {
                sprite.originalY = sprite.bottomBoundary;
                sprite.yVelocity *= -1; // Invert velocity when hitting bottom
            }
        }

        // Update sprite's Y position with wobble effect
        if (sprite.wobbleTween && sprite.wobbleTween.isPlaying()) {
            // Calculate current wobble offset based on tween progress
            const wobbleProgress = sprite.wobbleTween.progress;
            const wobbleCycle = Math.sin(wobbleProgress * Math.PI * 2); // Sinusoidal cycle
            const wobbleOffset = wobbleCycle * sprite.wobbleAmount;

            // Set Y position accounting for wobble
            sprite.y = sprite.originalY + wobbleOffset;
        } else {
            // If no wobble, just set Y directly
            sprite.y = sprite.originalY;
        }

        // Update depth based on Y position
        this.updateDepthBasedOnY(sprite);
    }

    updateDepthBasedOnY(sprite) {
        // Store references to sprites if we haven't already
        if (!this.depthSortedSprites) {
            this.depthSortedSprites = [
                this.children.getByName('thief'),
                this.children.getByName('guard')
            ].filter(s => s); // Filter out any undefined sprites

            // If we don't have any sprites to sort, exit
            if (this.depthSortedSprites.length < 2) return;
        }

        // Sort sprites by Y position (lower Y = higher depth)
        // This is reversed from before - characters higher on screen appear in front
        this.depthSortedSprites.sort((a, b) => a.y - b.y);

        // Assign depths based on sorted order
        this.depthSortedSprites.forEach((sprite, index) => {
            sprite.setDepth(index);
        });
    }

    flipSprite(sprite, flipX) {
        // Pause wobble animation if it exists
        if (sprite.wobbleTween) {
            sprite.wobbleTween.pause();
        }

        // Store the current scale for restoration
        const originalScaleX = sprite.scaleX;
        const originalScaleY = sprite.scaleY;

        // First squish horizontally
        this.tweens.add({
            targets: sprite,
            scaleX: 0.05, // Almost flat
            duration: 150,
            ease: 'Sine.easeIn',
            onComplete: () => {
                // Flip the sprite at the flattest point
                sprite.setFlipX(flipX);

                // Then expand back
                this.tweens.add({
                    targets: sprite,
                    scaleX: originalScaleX,
                    duration: 150,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        // Resume wobble animation
                        if (sprite.wobbleTween) {
                            sprite.wobbleTween.resume();
                        }
                    }
                });
            }
        });
    }

    setupFollowing(follower, target, distance, speed) {
        // Store the target and follower in properties
        follower.followTarget = target;
        follower.followDistance = distance;

        // Create a reference to the scene for use in callbacks
        const scene = this;

        // Create tweens that will be updated/restarted when target changes direction
        let followXTween = null;
        let followYTween = null;

        // Track the target's direction
        let lastDirection = 0;

        // Track the follower's last position to determine movement direction
        let lastX = follower.x;

        // Flag to track if an attack is in progress
        let attackInProgress = false;

        // Add update event for Y position and wobble effect
        this.time.addEvent({
            delay: 16, // ~60fps
            callback: () => this.updateYPosition(follower),
            callbackScope: this,
            loop: true
        });

        // Update function to check target position and adjust follower
        this.time.addEvent({
            delay: 100,
            callback: function () {
                // Get target's current position and calculate direction
                const targetX = target.x;
                const targetY = target.originalY || target.y; // Use originalY if available (for thief)
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

                    // Stop movement tweens during attack
                    if (followXTween && followXTween.isPlaying()) {
                        followXTween.pause();
                    }
                    if (followYTween && followYTween.isPlaying()) {
                        followYTween.pause();
                    }

                    // Execute attack animation
                    scene.performAttack(follower, target, () => {
                        // Reset attack flag when animation completes
                        attackInProgress = false;

                        // Resume wobble animation if it exists
                        if (follower.wobbleTween) {
                            follower.wobbleTween.resume();
                        }

                        // Resume movement tweens after attack
                        if (followXTween && followXTween.isPlaying()) {
                            followXTween.resume();
                        }
                        if (followYTween && followYTween.isPlaying()) {
                            followYTween.resume();
                        }
                    });

                    // Skip movement update during attack
                    return;
                }

                // Skip movement updates if attack is in progress
                if (attackInProgress) {
                    return;
                }

                // Calculate destination based on target's direction
                const destinationX = targetX - (distance * currentDirection);

                // Use target's Y position with a slight offset for depth perception
                const destinationY = targetY + 20;

                // If direction changed or no X tween exists, create a new follow X tween
                if (currentDirection !== lastDirection || !followXTween || !followXTween.isPlaying()) {
                    // Stop existing X tween if it exists
                    if (followXTween) {
                        followXTween.stop();
                    }

                    // Determine if guard will move right
                    const movingRight = destinationX > follower.x;

                    // Only flip if direction has changed
                    if (follower.flipX !== movingRight) {
                        this.flipSprite(follower, movingRight);
                    }

                    // Create new tween to smoothly move to the new X position
                    followXTween = scene.tweens.add({
                        targets: follower,
                        x: destinationX,
                        duration: 1000,
                        ease: 'Linear'
                    });

                    // Update last known direction
                    lastDirection = currentDirection;
                }

                // Always update Y position with a smooth tween
                // Stop existing Y tween if it exists
                if (followYTween && followYTween.isPlaying()) {
                    followYTween.stop();
                }

                // Create new tween to smoothly move to the new Y position
                followYTween = scene.tweens.add({
                    targets: { y: follower.originalY },
                    y: destinationY,
                    duration: 500, // Faster than X movement for more responsive following
                    ease: 'Sine.easeOut',
                    onUpdate: function () {
                        follower.originalY = this.targets[0].y;
                    }
                });
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
                        // Play attack sound at the landing phase
                        this.playRandomAttack();

                        // Play random grunt sound immediately when thief is hit
                        if (target.texture.key === 'Characters' && target.frame.name === 0) {
                            this.playRandomGrunt();
                        }

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

    playRandomGrunt() {
        // Select a random grunt sound (1-5)
        const gruntNumber = Phaser.Math.Between(1, 5);
        const gruntSound = `grunt${gruntNumber}`;

        // Generate a random pitch between 0.8 and 1.2
        const randomPitch = Phaser.Math.FloatBetween(0.8, 1.2);

        // Play the selected grunt sound with the random pitch
        this.sound.playAudioSprite('sfx', gruntSound, {
            detune: (randomPitch - 1) * 1200 // Convert pitch ratio to cents (1 octave = 1200 cents)
        });
    }

    playRandomCoin() {
        // Select a random coin sound (1-3)
        const coinNumber = Phaser.Math.Between(1, 3);
        const coinSound = `coin${coinNumber}`;

        // Generate a random pitch between 0.9 and 1.1
        const randomPitch = Phaser.Math.FloatBetween(0.9, 1.1);

        // Play the selected coin sound with the random pitch
        this.sound.playAudioSprite('sfx', coinSound, {
            detune: (randomPitch - 1) * 1200 // Convert pitch ratio to cents
        });
    }

    playRandomAttack() {
        // Select a random attack sound (1-5)
        const attackNumber = Phaser.Math.Between(1, 5);
        const attackSound = `attack${attackNumber}`;

        // Generate a random pitch between 0.9 and 1.1
        const randomPitch = Phaser.Math.FloatBetween(0.9, 1.1);

        // Play the selected attack sound with the random pitch
        this.sound.playAudioSprite('sfx', attackSound, {
            detune: (randomPitch - 1) * 1200 // Convert pitch ratio to cents
        });
    }

    startWobble(sprite, amount, duration) {
        // Create a wobble effect while walking
        sprite.wobbleTween = this.tweens.add({
            targets: sprite,
            scaleX: { from: 0.3, to: 0.32 },
            scaleY: { from: 0.3, to: 0.28 },
            // Don't directly modify y property here, as it's handled by updateYPosition
            // Instead, store the amount for use in updateYPosition
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Store wobble amount for use in updateYPosition
        sprite.wobbleAmount = amount;

        // Store reference to the tween on the sprite
        return sprite.wobbleTween;
    }
}

export default GuildScene; 
