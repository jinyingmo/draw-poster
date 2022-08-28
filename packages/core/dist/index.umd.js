(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.index = factory());
})(this, (function () { 'use strict';

  // 加载图片
  function loadImage(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
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

  // 获取图片像素
  function getImageData(img, rect = [0, 0, img.width, img.height]) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    return context.getImageData(...rect)
  }

  // 将图片处理成固定大小，并添加
  function drawImageProp(ctx, img, x = 0, y = 0, w = ctx.canvas.width, h = ctx.canvas.height) {
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    const iw = img.width;
    const ih = img.height;
    
    // 将要渲染的内容区域缩放，并使图片居中
    const r = Math.min(iw / w, ih / h);

    const cw = r * w;
    const ch = r * h;

    cx = (iw - cw) * 0.5; // 宽度差的一半作为起始横坐标
    cy = (ih - ch) * 0.5; // 高度差的一半作为起始纵坐标

    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
  }

  function resizeImage(img, w, h, radius) {
    return new Promise((resolve, reject) => {
      const canvas  = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // 获取四个角的圆角半径
      const radiusArr = radius ? radius.split(" ").map(num => Number(num)): [];
      let topLeftRadius = 0, topRightRadius = 0, bottomRightRadius = 0, bottomLeftRadius = 0;
      if(radiusArr.length === 1) {
        topLeftRadius = topRightRadius = bottomRightRadius = bottomLeftRadius = radiusArr[0];
      }
      if(radiusArr.length === 2) {
        topLeftRadius = bottomRightRadius = radiusArr[0];
        topRightRadius = bottomLeftRadius = radiusArr[1];
      }
      if(radiusArr.length === 3) {
        topLeftRadius = radiusArr[0];
        bottomRightRadius = radiusArr[2];
        topRightRadius = bottomLeftRadius = radiusArr[1];
      }
      if(radiusArr.length === 4) {
        topLeftRadius = radiusArr[0];
        topRightRadius = radiusArr[1];
        bottomRightRadius = radiusArr[2];
        bottomLeftRadius = radiusArr[3];
      }
      
      // 绘制圆角矩形
      ctx.beginPath();
      ctx.moveTo(topLeftRadius, 0);
      ctx.lineTo(w - topRightRadius, 0);
      if(topRightRadius) {
        ctx.arcTo(w, 0, w, topRightRadius, topRightRadius);
      }
      ctx.lineTo(w, h - bottomRightRadius);
      if(bottomRightRadius) {
        ctx.arcTo(w, h, w - bottomRightRadius, h, bottomRightRadius);
      }
      ctx.lineTo(bottomLeftRadius, h);
      if(bottomLeftRadius) {
        ctx.arcTo(0, h, 0, h - bottomLeftRadius, bottomLeftRadius);
      }
      ctx.lineTo(0, topLeftRadius);
      if(topLeftRadius) {
        ctx.arcTo(0, 0, topLeftRadius, 0, topLeftRadius);
      }
      ctx.closePath();
      ctx.clip(); // 绘制完裁剪

      if(typeof img === 'string') {
        ctx.fillStyle = img || '#ffffff';
        ctx.rect(0, 0, w, h);
        ctx.fill();
      } else if(img instanceof Image) {
        drawImageProp(ctx, img, 0, 0, w, h);
      }
      const imgData = canvas.toDataURL( 'image/png', 1 );
      resolve(imgData);
    })
  }

  /**
   * 处理canvas文字绘制
   * @param {string} text - 渲染的文字
   * @param {number} x - canvas的x坐标
   * @param {number} y - canvas的y坐标
   * @param {number} maxWidth - 文字框最大宽度
   * @param {number} lineHeight - 文字行高
   * @param {number} maxLines - 最大行数，超出则省略
   */

  function contextWrapText() {
    CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight, maxLines) {
      if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
          return
      }
      
      let context = this;
      let canvas = context.canvas;
      
      if (typeof maxWidth == 'undefined') {
          maxWidth = (canvas && canvas.width) || 300;
      }
      if (typeof lineHeight == 'undefined') {
          lineHeight = (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) || parseInt(window.getComputedStyle(document.body).lineHeight);
      }
      
      // 字符分隔为数组
      let arrText = Array.from(text);
      
      let line = '', lineNumber = 0;
      
      for (let n = 0; n < arrText.length; n++) {
        let testLine = line + arrText[n];
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        // 检查拼接的line字符串是否超出了最大长度，超出则渲染出来，然后继续下一行
        if (testWidth > maxWidth && n > 0) {
          lineNumber ++;
          // 如果行数超过了限制行数，则终止下面的渲染，然后在最后拼接...
          if(lineNumber >= maxLines && maxLines) {
            context.fillText(line.substring(0, line.length - 1) + '...', x, y);
            line = '';
            break
          } else {
            context.fillText(line, x, y);
            line = arrText[n];
            y += lineHeight;
          }
        } else {
            line = testLine;
        }
      }
      context.fillText(line, x, y);
      return {
        lineNumber
      }
    };
  }

  /**
   * drawPoster 类
   */

  class DrawPoster {
    constructor(ctx, options = {}) {
      if(!ctx) {
        throw new Error('Canvas context is required!')
      }
      const { ratio } = options;
      this.ratio = ratio;
      this.ctx = ctx;

      // 引入文字处理函数，挂在context下面
      contextWrapText();
    }
  }

  /**
   * 加载图片并返回Image对象
   * @param {String} src - 图片路径
   */
  DrawPoster.prototype.loadImage = async function(src) {
    if(!src || typeof src !== 'string') {
      throw new Error('Image url is required and must be a string!')
    }
    const img = await loadImage(src);
    return img
  };

  /**
   * 获取图片像素
   * @param {Image} img - 图片
   * @param {Array} rect - 像素获取范围
   */
  DrawPoster.prototype.getImageData = async function(img, rect = [0, 0, img.width, img.height]) {
    if(!img) {
      throw new Error('Image is required!')
    }
    if(!(img instanceof Image)) {
      throw new Error('Image type error!')
    }
    return getImageData(img, rect)
  };

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
    }

    w = w * this.ratio;
    h = h * this.ratio;
    radius = radius.split(" ").map(num => Number(num) * this.ratio).join(" ");

    const imgData = await resizeImage(img, w, h, radius);
    return imgData
  };

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
    const { lineNumber } = this.ctx.wrapText(text, x, y, maxWidth, lineHeight, maxLines);
    // 返回文字渲染的行数
    return { lineNumber }
  };

  /**
   * 实例化DrawPoster类并返回
   * @param {Object} ctx  - canvas context
   * @param {Number} ratio - 海报像素缩放比例
   */
  const createDrawPoster = (ctx, { ratio = 1 }) => {
    const drawPoster = new DrawPoster(ctx, { ratio });
    return drawPoster
  };

  /**
   * 获取drawPoster对象
   * @param {Object} ctx  - canvas context
   * @param {Number} ratio - 海报像素缩放比例
   */
  function index(ctx, options = {}) {
    const drawPoster = createDrawPoster(ctx, options);
    return drawPoster
  }

  return index;

}));
//# sourceMappingURL=index.umd.js.map
