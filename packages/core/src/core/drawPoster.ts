import { loadImage, getImageData } from '../utils/imgUtils'
import resizeImage from '../utils/resize'
import { contextWrapText } from '../utils/textUtils'

type DrawPosterOptions = {
  ratio?: number
}

class DrawPoster {
  private ratio: number
  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D, options: DrawPosterOptions = {}) {
    if (!ctx) {
      throw new Error('Canvas context is required!')
    }
    const { ratio = 1 } = options
    this.ratio = ratio
    this.ctx = ctx
    contextWrapText()
  }

  async loadImage(src: string): Promise<HTMLImageElement> {
    if (!src || typeof src !== 'string') {
      throw new Error('Image url is required and must be a string!')
    }
    const img = await loadImage(src)
    return img
  }

  async getImageData(
    img: HTMLImageElement,
    rect: [number, number, number, number] = [0, 0, img.width, img.height]
  ): Promise<ImageData> {
    if (!img) {
      throw new Error('Image is required!')
    }
    if (!(img instanceof Image)) {
      throw new Error('Image type error!')
    }
    return getImageData(img, rect)
  }

  async resizeImage(img: HTMLImageElement | string, w: number, h: number, radius = '0'): Promise<string> {
    if (!img) {
      throw new Error('Image is required!')
    }
    const targetWidth = w * this.ratio
    const targetHeight = h * this.ratio
    const targetRadius = radius
      .split(' ')
      .map((num) => Number(num) * this.ratio)
      .join(' ')

    const imgData = await resizeImage(img, targetWidth, targetHeight, targetRadius)
    return imgData
  }

  wrapText(text: string, x: number, y: number, maxWidth?: number, lineHeight?: number, maxLines?: number) {
    const result = this.ctx.wrapText(text, x, y, maxWidth, lineHeight, maxLines)
    return result
  }
}

export default DrawPoster
