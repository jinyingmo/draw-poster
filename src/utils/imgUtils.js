// 加载图片
export function loadImage(src) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(img)
    }
    img.onerror = () => {
      reject(`获取${src}失败`)
    }
    img.src = src;
  });
}

// 获取图片像素
export function getImageData(img, rect = [0, 0, img.width, img.height]) {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const context = canvas.getContext('2d')
  context.drawImage(img, 0, 0)
  return context.getImageData(...rect)
}