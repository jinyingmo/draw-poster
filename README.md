# draw-poster - html canvas绘制海报工具库

基于公司海报开发项目的需求，整理的canvas工具库，可以实现部分复杂图形的绘制，不断更新中...

## 案例

## 使用
```
import drawPosterFunc from 'draw-poster'
const drawPoster = drawPosterFunc(context, options)
```
### options
```
{
  ratio: 1 // 海报像素比例
}
```
### loadImage加载图片
```
// src为图片路径，img为Image类的实例
const img = drawPoster.loadImage(src)
```
### getImageData获取图片像素数据
```
// img为Image类的实例， rect为获取像素的范围，默认[0, 0, img.width, img.height]
// imgData为base64类型的数据
const imgData = drawPoster.getImageData(img, rect)
```
### resizeImage修改图片尺寸和加圆角
```
// img为Image类的实例，w为目标宽度，h为目标高度，radius为圆角，使用类似border-radius，例如"2 2 0 0"
// imgData为base64类型的数据
const imgData = drawPoster.resizeImage(img, w, h, radius)
```
### wrapText绘制文字
```
// text为需要绘制的文案，x为canvas上起点的x坐标，y为canvas上起点的y坐标，maxWidth为文案的最大宽度，lineHeight为行高， maxLines为最大行数，超出则省略
// lineNumber为文字最终渲染行数
const lineNumber = drawPoster.wrapText(text, x, y, maxWidth, lineHeight, maxLines)
```

