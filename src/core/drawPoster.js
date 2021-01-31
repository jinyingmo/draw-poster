/**
 * drawPoster 类
 */

import { loadImage, getImageData } from '../utils/imgUtils'
import resizeImage from '../utils/resize'
import { contextWrapText } from '../utils/textUtils'

class DrawPoster {
  constructor(ctx, options = {}) {
    if(!ctx) {
      throw new Error('Canvas context is required!')
    }
    const { ratio } = options
    this.ratio = ratio
    this.ctx = ctx

    // 引入文字处理函数，挂在context下面
    contextWrapText()
  }
}

/**
 * 加载图片并返回Image对象
 * @param {String} src - 图片路径
 */
DrawPoster.prototype.loadImage = async function(src) {
  if(!src || typeof src !== 'string') {
    throw new Error('Image url is required and must be a string!')
    return 
  }
  const img = await loadImage(src)
  return img
}

/**
 * 获取图片像素
 * @param {Image} img - 图片
 * @param {Array} rect - 像素获取范围
 */
DrawPoster.prototype.getImageData = async function(img, rect = [0, 0, img.width, img.height]) {
  if(!img) {
    throw new Error('Image is required!')
    return 
  }
  if(!(img instanceof Image)) {
    throw new Error('Image type error!')
    return 
  }
  return getImageData(img, rect)
}

/**
 * 裁剪图片
 * @param {Image} img - 图片
 * @param {Number} w - 新图片宽度
 * @param {Number} h - 新图片高度
 * @param {String} radius - 新图片圆角
 */
DrawPoster.prototype.resizeImage = async function(img, w, h, radius) {
  if(!img) {
    throw new Error('Image is required!')
    return 
  }

  w = w * this.ratio
  h = h * this.ratio
  radius = radius.split(" ").map(num => Number(num) * this.ratio).join(" ")

  const imgData = await resizeImage(img, w, h, radius)
  return imgData
}

/**
 * 渲染文字
 * @param {string} text - 渲染的文字
 * @param {number} x - canvas的x坐标
 * @param {number} y - canvas的y坐标
 * @param {number} maxWidth - 文字框最大宽度
 * @param {number} lineHeight - 文字行高
 * @param {number} maxLines - 最大行数，超出则省略
 */
DrawPoster.prototype.wrapText = function(text, x, y, maxWidth, lineHeight, maxLines) {
  const { lineNumber } = this.ctx.wrapText(text, x, y, maxWidth, lineHeight, maxLines)
  // 返回文字渲染的行数
  return { lineNumber }
}

export default DrawPoster