// 将图片处理成固定大小，并添加
function drawImageProp(ctx, img, x = 0, y = 0, w = ctx.canvas.width, h = ctx.canvas.height) {
  if (offsetX < 0) offsetX = 0
  if (offsetY < 0) offsetY = 0
  if (offsetX > 1) offsetX = 1
  if (offsetY > 1) offsetY = 1

  const iw = img.width
  const ih = img.height
  
  // 将要渲染的内容区域缩放，并使图片居中
  const r = Math.min(iw / w, ih / h)

  const cw = r * w
  const ch = r * h

  cx = (iw - cw) * 0.5 // 宽度差的一半作为起始横坐标
  cy = (ih - ch) * 0.5 // 高度差的一半作为起始纵坐标

  ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h)
}

export default function resizeImage(img, w, h, radius) {
  return new Promise((resolve, reject) => {
    const canvas  = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    // 获取四个角的圆角半径
    const radiusArr = radius ? radius.split(" ").map(num => Number(num)): []
    let topLeftRadius = 0, topRightRadius = 0, bottomRightRadius = 0, bottomLeftRadius = 0
    if(radiusArr.length === 1) {
      topLeftRadius = topRightRadius = bottomRightRadius = bottomLeftRadius = radiusArr[0]
    }
    if(radiusArr.length === 2) {
      topLeftRadius = bottomRightRadius = radiusArr[0]
      topRightRadius = bottomLeftRadius = radiusArr[1]
    }
    if(radiusArr.length === 3) {
      topLeftRadius = radiusArr[0]
      bottomRightRadius = radiusArr[2]
      topRightRadius = bottomLeftRadius = radiusArr[1]
    }
    if(radiusArr.length === 4) {
      topLeftRadius = radiusArr[0]
      topRightRadius = radiusArr[1]
      bottomRightRadius = radiusArr[2]
      bottomLeftRadius = radiusArr[3]
    }
    
    // 绘制圆角矩形
    ctx.beginPath();
    ctx.moveTo(topLeftRadius, 0)
    ctx.lineTo(w - topRightRadius, 0)
    if(topRightRadius) {
      ctx.arcTo(w, 0, w, topRightRadius, topRightRadius)
    }
    ctx.lineTo(w, h - bottomRightRadius)
    if(bottomRightRadius) {
      ctx.arcTo(w, h, w - bottomRightRadius, h, bottomRightRadius)
    }
    ctx.lineTo(bottomLeftRadius, h)
    if(bottomLeftRadius) {
      ctx.arcTo(0, h, 0, h - bottomLeftRadius, bottomLeftRadius)
    }
    ctx.lineTo(0, topLeftRadius)
    if(topLeftRadius) {
      ctx.arcTo(0, 0, topLeftRadius, 0, topLeftRadius)
    }
    ctx.closePath()
    ctx.clip() // 绘制完裁剪

    if(typeof img === 'string') {
      ctx.fillStyle = img || '#ffffff'
      ctx.rect(0, 0, w, h)
      ctx.fill()
    } else if(img instanceof Image) {
      drawImageProp(ctx, img, 0, 0, w, h, 0.5, 0.5)
    }
    const imgData = canvas.toDataURL( 'image/png', 1 )
    resolve(imgData)
  })
}

