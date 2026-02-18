/**
 * 加载图片
 * @param src 图片地址
 * @returns Promise<HTMLImageElement>
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(`获取${src}失败`);
    };
    img.src = src;
  });
}

/**
 * 获取图片数据
 * @param img 图片元素
 * @param rect 截取区域 [x, y, width, height]
 * @returns ImageData
 */
export function getImageData(
  img: HTMLImageElement,
  rect: [number, number, number, number] = [0, 0, img.width, img.height],
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context is required!");
  }
  context.drawImage(img, 0, 0);
  return context.getImageData(...rect);
}
