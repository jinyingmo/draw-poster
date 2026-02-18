import { scaleValue } from './canvas'

/**
 * 导出为 DataURL
 * @param ctx Canvas 上下文
 * @param type 图片类型
 * @param quality 图片质量
 * @returns DataURL 字符串
 */
export const exportDataURL = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  type = 'image/png',
  quality = 1
) => {
  const canvas = ctx.canvas as HTMLCanvasElement | OffscreenCanvas
  return (canvas as HTMLCanvasElement).toDataURL(type, quality)
}

/**
 * 导出为 Blob
 * @param ctx Canvas 上下文
 * @param type 图片类型
 * @param quality 图片质量
 * @returns Promise<Blob>
 */
export const exportBlob = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  type = 'image/png',
  quality = 1
) => {
  const canvas = ctx.canvas as HTMLCanvasElement | OffscreenCanvas
  return new Promise<Blob>((resolve, reject) => {
    if ((canvas as HTMLCanvasElement).toBlob) {
      (canvas as HTMLCanvasElement).toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Blob export failed'))
        }
      }, type, quality)
      return
    }
    try {
      const dataUrl = (canvas as HTMLCanvasElement).toDataURL(type, quality)
      const [meta, data] = dataUrl.split(',')
      const mimeMatch = meta.match(/data:(.*?);base64/)
      const mimeType = mimeMatch ? mimeMatch[1] : type
      const binary = atob(data)
      const buffer = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i += 1) {
        buffer[i] = binary.charCodeAt(i)
      }
      resolve(new Blob([buffer], { type: mimeType }))
    } catch (error) {
      reject(error as Error)
    }
  })
}

/**
 * 导出 ImageData
 * @param ctx Canvas 上下文
 * @param rect 截取区域 [x, y, width, height]
 * @param ratio 缩放比例
 * @returns ImageData
 */
export const exportImageData = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  rect?: [number, number, number, number],
  ratio = 1
) => {
  if (rect) {
    const [x, y, width, height] = rect
    return ctx.getImageData(
      scaleValue(x, ratio),
      scaleValue(y, ratio),
      scaleValue(width, ratio),
      scaleValue(height, ratio)
    )
  }
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
}
