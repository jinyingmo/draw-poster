/**
 * 错误处理函数
 */
export const handleError = (e) => {
  if(process.env.NODE_ENV !== 'production') {
    console.error(e.message)
  }
  // todo 添加错误监控
}