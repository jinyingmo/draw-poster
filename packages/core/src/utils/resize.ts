function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x = 0,
  y = 0,
  w = ctx.canvas.width,
  h = ctx.canvas.height,
  offsetX = 0.5,
  offsetY = 0.5
) {
  if (offsetX < 0) offsetX = 0
  if (offsetY < 0) offsetY = 0
  if (offsetX > 1) offsetX = 1
  if (offsetY > 1) offsetY = 1

  const iw = img.width
  const ih = img.height

  const r = Math.min(iw / w, ih / h)
  const cw = r * w
  const ch = r * h

  const cx = (iw - cw) * offsetX
  const cy = (ih - ch) * offsetY

  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h)
}

export default function resizeImage(
  img: HTMLImageElement | string,
  w: number,
  h: number,
  radius?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas context is required!'))
      return
    }

    const radiusArr = radius ? radius.split(' ').map((num) => Number(num)) : []
    let topLeftRadius = 0
    let topRightRadius = 0
    let bottomRightRadius = 0
    let bottomLeftRadius = 0
    if (radiusArr.length === 1) {
      topLeftRadius = topRightRadius = bottomRightRadius = bottomLeftRadius = radiusArr[0]
    }
    if (radiusArr.length === 2) {
      topLeftRadius = bottomRightRadius = radiusArr[0]
      topRightRadius = bottomLeftRadius = radiusArr[1]
    }
    if (radiusArr.length === 3) {
      topLeftRadius = radiusArr[0]
      bottomRightRadius = radiusArr[2]
      topRightRadius = bottomLeftRadius = radiusArr[1]
    }
    if (radiusArr.length === 4) {
      topLeftRadius = radiusArr[0]
      topRightRadius = radiusArr[1]
      bottomRightRadius = radiusArr[2]
      bottomLeftRadius = radiusArr[3]
    }

    ctx.beginPath()
    ctx.moveTo(topLeftRadius, 0)
    ctx.lineTo(w - topRightRadius, 0)
    if (topRightRadius) {
      ctx.arcTo(w, 0, w, topRightRadius, topRightRadius)
    }
    ctx.lineTo(w, h - bottomRightRadius)
    if (bottomRightRadius) {
      ctx.arcTo(w, h, w - bottomRightRadius, h, bottomRightRadius)
    }
    ctx.lineTo(bottomLeftRadius, h)
    if (bottomLeftRadius) {
      ctx.arcTo(0, h, 0, h - bottomLeftRadius, bottomLeftRadius)
    }
    ctx.lineTo(0, topLeftRadius)
    if (topLeftRadius) {
      ctx.arcTo(0, 0, topLeftRadius, 0, topLeftRadius)
    }
    ctx.closePath()
    ctx.clip()

    if (typeof img === 'string') {
      ctx.fillStyle = img || '#ffffff'
      ctx.rect(0, 0, w, h)
      ctx.fill()
    } else if (img instanceof Image) {
      drawImageProp(ctx, img, 0, 0, w, h, 0.5, 0.5)
    }
    const imgData = canvas.toDataURL('image/png', 1)
    resolve(imgData)
  })
}
