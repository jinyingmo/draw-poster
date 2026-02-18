import type { StyleOptions, TransformOptions, FillStyle } from './types'

/**
 * 根据缩放比例计算数值
 * @param value 原始数值
 * @param ratio 缩放比例
 * @returns 缩放后的数值
 */
export const scaleValue = (value: number, ratio: number) => value * ratio

/**
 * 根据缩放比例计算数组中的数值
 * @param values 原始数值数组
 * @param ratio 缩放比例
 * @returns 缩放后的数值数组
 */
export const scaleArray = (values: number[] | undefined, ratio: number) =>
  values ? values.map((value) => value * ratio) : undefined

/**
 * 解析颜色值，支持字符串、渐变对象、图案对象
 * @param ctx Canvas 上下文
 * @param color 颜色配置
 * @param ratio 缩放比例
 * @returns Canvas 颜色值
 */
const resolveColor = (ctx: CanvasRenderingContext2D, color: FillStyle, ratio: number) => {
  if (typeof color === 'string') return color
  if (color instanceof CanvasGradient || color instanceof CanvasPattern) return color

  // 线性渐变
  if (color.type === 'linear') {
    const { x0, y0, x1, y1, stops } = color
    const gradient = ctx.createLinearGradient(
      scaleValue(x0, ratio),
      scaleValue(y0, ratio),
      scaleValue(x1, ratio),
      scaleValue(y1, ratio)
    )
    stops.forEach((stop) => gradient.addColorStop(stop.offset, stop.color))
    return gradient
  }

  // 径向渐变
  if (color.type === 'radial') {
    const { x0, y0, r0, x1, y1, r1, stops } = color
    const gradient = ctx.createRadialGradient(
      scaleValue(x0, ratio),
      scaleValue(y0, ratio),
      scaleValue(r0, ratio),
      scaleValue(x1, ratio),
      scaleValue(y1, ratio),
      scaleValue(r1, ratio)
    )
    stops.forEach((stop) => gradient.addColorStop(stop.offset, stop.color))
    return gradient
  }

  // 图案填充
  if (color.type === 'pattern') {
    const { image, repetition } = color
    if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
      const pattern = ctx.createPattern(image, repetition || 'repeat')
      return pattern || 'transparent'
    }
  }
  return 'transparent'
}

/**
 * 应用 Canvas 样式
 * @param ctx Canvas 上下文
 * @param styles 样式配置
 * @param ratio 缩放比例
 */
export const applyStyles = (
  ctx: CanvasRenderingContext2D,
  styles: StyleOptions = {},
  ratio = 1
) => {
  if (typeof styles.globalAlpha === 'number') {
    ctx.globalAlpha = styles.globalAlpha
  }
  if (styles.fillStyle) {
    ctx.fillStyle = resolveColor(ctx, styles.fillStyle, ratio)
  }
  if (styles.strokeStyle) {
    ctx.strokeStyle = resolveColor(ctx, styles.strokeStyle, ratio)
  }
  if (typeof styles.lineWidth === 'number') {
    ctx.lineWidth = scaleValue(styles.lineWidth, ratio)
  }
  if (styles.lineJoin) {
    ctx.lineJoin = styles.lineJoin
  }
  if (styles.lineCap) {
    ctx.lineCap = styles.lineCap
  }
  if (styles.lineDash) {
    ctx.setLineDash(scaleArray(styles.lineDash, ratio) || [])
  }
  if (styles.shadowColor) {
    ctx.shadowColor = styles.shadowColor
  }
  if (typeof styles.shadowBlur === 'number') {
    ctx.shadowBlur = scaleValue(styles.shadowBlur, ratio)
  }
  if (typeof styles.shadowOffsetX === 'number') {
    ctx.shadowOffsetX = scaleValue(styles.shadowOffsetX, ratio)
  }
  if (typeof styles.shadowOffsetY === 'number') {
    ctx.shadowOffsetY = scaleValue(styles.shadowOffsetY, ratio)
  }
}

/**
 * 在保存的上下文中执行绘制操作
 * @param ctx Canvas 上下文
 * @param styles 样式配置
 * @param ratio 缩放比例
 * @param draw 绘制回调函数
 */
export const withContext = (
  ctx: CanvasRenderingContext2D,
  styles: StyleOptions | undefined,
  ratio: number,
  draw: () => void
) => {
  ctx.save()
  if (styles) {
    applyStyles(ctx, styles, ratio)
  }
  draw()
  ctx.restore()
}

/**
 * 设置 Canvas 尺寸
 * @param ctx Canvas 上下文
 * @param width 宽度
 * @param height 高度
 * @param ratio 像素比率
 */
export const setCanvasSize = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ratio: number
) => {
  const canvas = ctx.canvas as HTMLCanvasElement
  canvas.width = scaleValue(width, ratio)
  canvas.height = scaleValue(height, ratio)
  if (canvas.style) {
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }
}

/**
 * 清空 Canvas
 * @param ctx Canvas 上下文
 * @param rect 清除区域 [x, y, width, height]，默认为整个画布
 * @param ratio 缩放比例
 */
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  rect?: [number, number, number, number],
  ratio = 1
) => {
  if (rect) {
    const [x, y, width, height] = rect
    ctx.clearRect(scaleValue(x, ratio), scaleValue(y, ratio), scaleValue(width, ratio), scaleValue(height, ratio))
  } else {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
}

/**
 * 应用 Canvas 变换
 * @param ctx Canvas 上下文
 * @param options 变换配置
 * @param ratio 缩放比例
 */
export const applyTransform = (
  ctx: CanvasRenderingContext2D,
  options: TransformOptions = {},
  ratio = 1
) => {
  const {
    translateX = 0,
    translateY = 0,
    rotate = 0,
    scaleX = 1,
    scaleY = 1
  } = options
  
  if (translateX || translateY) {
    ctx.translate(scaleValue(translateX, ratio), scaleValue(translateY, ratio))
  }
  if (rotate) {
    ctx.rotate(rotate)
  }
  if (scaleX !== 1 || scaleY !== 1) {
    ctx.scale(scaleX, scaleY)
  }
}
