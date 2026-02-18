import { createDrawPoster } from "../core/drawPoster";
import { ResourceManager } from "../utils/resource";

// Mock Canvas Context
class MockContext {
  canvas = { width: 100, height: 100 };
  save = jest.fn();
  restore = jest.fn();
  clearRect = jest.fn();
  drawImage = jest.fn();
  measureText = jest.fn(() => ({ width: 10 }));
  scale = jest.fn();
  translate = jest.fn();
  rotate = jest.fn();
  beginPath = jest.fn();
  moveTo = jest.fn();
  lineTo = jest.fn();
  stroke = jest.fn();
  fill = jest.fn();
  clip = jest.fn();
  rect = jest.fn();
  arc = jest.fn();
  strokeRect = jest.fn(); // Added missing method
}

// Global mock for CanvasRenderingContext2D
global.CanvasRenderingContext2D = MockContext as any;

describe("DrawPoster Core", () => {
  let ctx: any;
  let drawPoster: any;

  beforeEach(() => {
    ctx = new MockContext();
    drawPoster = createDrawPoster(ctx, { debug: true });
  });

  test("should initialize correctly", () => {
    expect(drawPoster).toBeDefined();
    expect(drawPoster.stats).toEqual({
      renderTime: 0,
      loadTime: 0,
      layerCount: 0,
    });
  });

  test("should track layer count", async () => {
    drawPoster.addLayer({ type: "rect", x: 0, y: 0, width: 10, height: 10 });
    drawPoster.addLayer({ type: "circle", x: 0, y: 0, radius: 5 });

    await drawPoster.render();

    expect(drawPoster.stats.layerCount).toBe(2);
  });

  test("should track render time", async () => {
    drawPoster.addLayer({ type: "rect", x: 0, y: 0, width: 10, height: 10 });

    await drawPoster.render();

    expect(drawPoster.stats.renderTime).toBeGreaterThanOrEqual(0);
  });

  test("should track load time for images", async () => {
    // Mock ResourceManager load
    const mockLoad = jest.fn().mockResolvedValue(new Image());
    const resourceManager = new ResourceManager();
    resourceManager.load = mockLoad;

    drawPoster = createDrawPoster(ctx, { resourceManager });

    drawPoster.addLayer({
      type: "image",
      image: "test.png",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    await drawPoster.render();

    expect(drawPoster.stats.loadTime).toBeGreaterThanOrEqual(0);
    expect(mockLoad).toHaveBeenCalledWith("test.png");
  });
});
