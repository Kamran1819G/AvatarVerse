import Phaser from 'phaser'
import { BackgroundMode } from '../../../types/BackgroundMode'

export default class Background extends Phaser.Scene {
  private clouds!: Phaser.Physics.Arcade.Group
  private backgroundConfig: Record<BackgroundMode, {
    backdropKey: string;
    cloudKey: string;
    backgroundColor: string;
  }> = {
    [BackgroundMode.DAY]: {
      backdropKey: 'backdrop_day',
      cloudKey: 'cloud_day',
      backgroundColor: '#c6eefc'
    },
    [BackgroundMode.NIGHT]: {
      backdropKey: 'backdrop_night',
      cloudKey: 'cloud_night', 
      backgroundColor: '#2c4464'
    }
  }

  constructor() {
    super('background')
  }

  create(data: { backgroundMode: BackgroundMode }) {
    const { width: sceneWidth, height: sceneHeight } = this.cameras.main

    // Get configuration based on background mode
    const { backdropKey, cloudKey, backgroundColor } = this.backgroundConfig[data.backgroundMode]
    
    // Set background color
    this.cameras.main.setBackgroundColor(backgroundColor)

    // Add backdrop image
    this.addScaledImage(sceneWidth / 2, sceneHeight / 2, backdropKey)

    // Add sun or moon image
    this.addScaledImage(sceneWidth / 2, sceneHeight / 2, 'sun_moon')

    // Add clouds
    this.createClouds(cloudKey, sceneWidth, sceneHeight)
  }

  private addScaledImage(x: number, y: number, key: string) {
    const image = this.add.image(x, y, key)
    const scale = Math.max(
      this.cameras.main.width / image.width, 
      this.cameras.main.height / image.height
    )
    return image.setScale(scale).setScrollFactor(0)
  }

  private createClouds(cloudKey: string, sceneWidth: number, sceneHeight: number) {
    const frames = this.textures.get(cloudKey).getFrameNames()
    this.clouds = this.physics.add.group()

    Array.from({ length: 24 }, (_, i) => {
      const x = Phaser.Math.RND.between(-sceneWidth * 0.5, sceneWidth * 1.5)
      const y = Phaser.Math.RND.between(sceneHeight * 0.2, sceneHeight * 0.8)
      const velocity = Phaser.Math.RND.between(15, 30)

      this.clouds
        .get(x, y, cloudKey, frames[i % frames.length])
        .setScale(3)
        .setVelocity(velocity, 0)
    })
  }

  update() {
    this.physics.world.wrap(this.clouds, 500)
  }
}