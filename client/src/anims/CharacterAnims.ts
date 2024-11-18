import Phaser from 'phaser'

export const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
  // Increased base frame rate for smoother animations
  const animsFrameRate = 24

  // Animation configuration for different states
  const animationStates = {
    idle: {
      frameRate: animsFrameRate * 0.6,
      repeat: -1,
      frames: {
        right: { start: 0, end: 5 },
        up: { start: 6, end: 11 },
        left: { start: 12, end: 17 },
        down: { start: 18, end: 23 }
      }
    },
    run: {
      frameRate: animsFrameRate * 1.2, // Faster movement animations
      repeat: -1,
      frames: {
        right: { start: 24, end: 29 },
        up: { start: 30, end: 35 },
        left: { start: 36, end: 41 },
        down: { start: 42, end: 47 }
      }
    },
    sit: {
      frameRate: animsFrameRate,
      repeat: 0,
      frames: {
        down: { start: 48, end: 48 },
        left: { start: 49, end: 49 },
        right: { start: 50, end: 50 },
        up: { start: 51, end: 51 }
      }
    }
  }

  // Characters to create animations for
  const characters = ['nancy', 'lucy', 'ash', 'adam']

  // Create animations for each character and state
  characters.forEach(character => {
    Object.entries(animationStates).forEach(([state, config]) => {
      Object.entries(config.frames).forEach(([direction, frames]) => {
        const key = `${character}_${state}_${direction}`
        
        anims.create({
          key,
          frames: anims.generateFrameNames(character, {
            start: frames.start,
            end: frames.end,
          }),
          repeat: config.repeat,
          frameRate: config.frameRate,
          yoyo: state === 'idle', // Makes idle animations slightly bounce
          skipMissedFrames: false, // Ensures smooth playback
          delay: 0, // No delay between repetitions
          hideOnComplete: false, // Keep the last frame visible
        })
      })
    })
  })

  // Add transition animations
  const transitionFrameRate = animsFrameRate * 2
  characters.forEach(character => {
    // Idle to run transition
    anims.create({
      key: `${character}_idle_to_run`,
      frames: [
        ...anims.generateFrameNames(character, { start: 18, end: 23 })
      ],
      frameRate: transitionFrameRate,
      repeat: 0,
      skipMissedFrames: false,
      hideOnComplete: false,
    })

    // Run to idle transition
    anims.create({
      key: `${character}_run_to_idle`,
      frames: [
        ...anims.generateFrameNames(character, { start: 23, end: 18 })
      ],
      frameRate: transitionFrameRate,
      repeat: 0,
      skipMissedFrames: false,
      hideOnComplete: false,
    })
  })
}

// Helper function to create smooth movement
export const createSmoothMovement = (scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) => {
  // Add tweening for smooth position changes
  const moveToPosition = (x: number, y: number, duration: number = 300) => {
    scene.tweens.add({
      targets: sprite,
      x,
      y,
      duration,
      ease: 'Power1' // Built-in Phaser easing function
    })
  }

  // Add smooth direction changes
  const changeDirection = (newDirection: string, character: string, state: 'idle' | 'run') => {
    const currentAnim = sprite.anims.currentAnim
    if (currentAnim) {
      const newAnim = `${character}_${state}_${newDirection}`
      if (currentAnim.key !== newAnim) {
        sprite.play(newAnim)
      }
    }
  }

  return {
    moveToPosition,
    changeDirection
  }
}