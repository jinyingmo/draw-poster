/**
 * 字体加载配置
 */
export interface FontLoadOptions {
  /** 字体族名称 */
  family: string;
  /** 字体源 URL */
  source: string;
  /** 字体描述符 */
  descriptors?: FontFaceDescriptors;
}

/**
 * 加载字体
 * @param options 字体配置
 * @returns Promise<void>
 */
export const loadFont = async (options: FontLoadOptions): Promise<void> => {
  const { family, source, descriptors } = options;
  
  if (typeof FontFace === "undefined") {
    console.warn("当前环境不支持 FontFace API");
    return;
  }

  try {
    const fontFace = new FontFace(family, `url(${source})`, descriptors);
    await fontFace.load();
    document.fonts.add(fontFace);
  } catch (error) {
    console.error(`字体加载失败: ${family}`, error);
    throw error;
  }
};
