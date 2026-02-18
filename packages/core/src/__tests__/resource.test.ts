
import { ResourceManager } from "../utils/resource";

// Mock loadImage
jest.mock("../utils/imgUtils", () => ({
  loadImage: jest.fn((src: string) => {
    return new Promise((resolve, reject) => {
      if (src === "error") {
        reject(new Error("Load failed"));
      } else {
        const img = new Image();
        img.src = src;
        setTimeout(() => resolve(img), 10);
      }
    });
  }),
}));

describe("ResourceManager", () => {
  let resourceManager: ResourceManager;

  beforeEach(() => {
    resourceManager = new ResourceManager();
    jest.clearAllMocks();
  });

  test("should load image successfully", async () => {
    const img = await resourceManager.load("test.png");
    expect(img).toBeDefined();
    expect(img.src).toContain("test.png");
  });

  test("should cache loaded images", async () => {
    const src = "test.png";
    const img1 = await resourceManager.load(src);
    const img2 = await resourceManager.load(src);

    expect(img1).toBe(img2);
    expect(require("../utils/imgUtils").loadImage).toHaveBeenCalledTimes(1);
  });

  test("should handle concurrent requests for same image", async () => {
    const src = "test.png";
    const [img1, img2] = await Promise.all([
      resourceManager.load(src),
      resourceManager.load(src),
    ]);

    expect(img1).toBe(img2);
    expect(require("../utils/imgUtils").loadImage).toHaveBeenCalledTimes(1);
  });

  test("should handle load errors", async () => {
    await expect(resourceManager.load("error")).rejects.toThrow("Load failed");
  });

  test("should clear cache", async () => {
    const src = "test.png";
    await resourceManager.load(src);
    resourceManager.clear();
    await resourceManager.load(src);

    expect(require("../utils/imgUtils").loadImage).toHaveBeenCalledTimes(2);
  });
});
