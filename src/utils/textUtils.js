/**
 * 处理canvas文字绘制
 * @param {string} text - 渲染的文字
 * @param {number} x - canvas的x坐标
 * @param {number} y - canvas的y坐标
 * @param {number} maxWidth - 文字框最大宽度
 * @param {number} lineHeight - 文字行高
 * @param {number} maxLines - 最大行数，超出则省略
 */

export function contextWrapText() {
  CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight, maxLines) {
    if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
        return
    }
    
    let context = this
    let canvas = context.canvas
    
    if (typeof maxWidth == 'undefined') {
        maxWidth = (canvas && canvas.width) || 300
    }
    if (typeof lineHeight == 'undefined') {
        lineHeight = (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) || parseInt(window.getComputedStyle(document.body).lineHeight)
    }
    
    // 字符分隔为数组
    let arrText = Array.from(text)
    
    let line = '', lineNumber = 0
    
    for (let n = 0; n < arrText.length; n++) {
      let testLine = line + arrText[n]
      let metrics = context.measureText(testLine)
      let testWidth = metrics.width
      // 检查拼接的line字符串是否超出了最大长度，超出则渲染出来，然后继续下一行
      if (testWidth > maxWidth && n > 0) {
        lineNumber ++
        // 如果行数超过了限制行数，则终止下面的渲染，然后在最后拼接...
        if(lineNumber >= maxLines && maxLines) {
          context.fillText(line.substring(0, line.length - 1) + '...', x, y)
          line = ''
          break
        } else {
          context.fillText(line, x, y)
          line = arrText[n]
          y += lineHeight
        }
      } else {
          line = testLine
      }
    }
    context.fillText(line, x, y)
    return {
      lineNumber
    }
  }
}