/**
 * 统一错误处理
 * @param e 错误对象
 */
export const handleError = (e: unknown) => {
  const globalProcess = (
    globalThis as { process?: { env?: { NODE_ENV?: string } } }
  ).process;
  const isProduction = globalProcess?.env?.NODE_ENV === "production";
  if (!isProduction) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error(String(e));
    }
  }
};
