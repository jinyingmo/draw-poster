import { loadImage } from "./imgUtils";

export class ResourceManager {
  private cache = new Map<string, HTMLImageElement>();
  private pending = new Map<string, Promise<HTMLImageElement>>();

  /**
   * 加载资源
   * @param src 资源地址
   * @returns Promise<HTMLImageElement>
   */
  async load(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    if (this.pending.has(src)) {
      return this.pending.get(src)!;
    }

    const promise = loadImage(src)
      .then((img) => {
        this.cache.set(src, img);
        this.pending.delete(src);
        return img;
      })
      .catch((err) => {
        this.pending.delete(src);
        throw err;
      });

    this.pending.set(src, promise);
    return promise;
  }

  /**
   * 预加载多个资源
   * @param srcs 资源地址列表
   * @returns Promise<void>
   */
  async preload(srcs: string[]): Promise<void> {
    await Promise.all(srcs.map((src) => this.load(src)));
  }

  /**
   * 获取缓存的资源
   * @param src 资源地址
   * @returns HTMLImageElement | undefined
   */
  get(src: string): HTMLImageElement | undefined {
    return this.cache.get(src);
  }

  /**
   * 清除缓存
   * @param src 资源地址 (可选，不传则清除所有)
   */
  clear(src?: string) {
    if (src) {
      this.cache.delete(src);
      this.pending.delete(src);
    } else {
      this.cache.clear();
      this.pending.clear();
    }
  }
}
