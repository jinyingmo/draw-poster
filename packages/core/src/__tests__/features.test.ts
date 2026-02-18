import { createDrawPoster } from "../core";
import { DrawPosterPlugin, Layer } from "../core/types";

// Mock Canvas Context globally
class MockCanvasRenderingContext2D {
  wrapText() {
    return { lineNumber: 1 };
  }
}
class MockCanvasGradient {
  addColorStop() {}
}
class MockCanvasPattern {}

const globalAny = globalThis as any;
globalAny.CanvasRenderingContext2D = MockCanvasRenderingContext2D;
globalAny.CanvasGradient = MockCanvasGradient;
globalAny.CanvasPattern = MockCanvasPattern;

// Mock Canvas Context
const createMockContext = () => {
  const canvas = {
    width: 0,
    height: 0,
    style: {} as Record<string, string>,
    toDataURL: jest.fn(() => "data:image/png;base64,xxx"),
    toBlob: jest.fn((callback: (blob: Blob | null) => void) =>
      callback(new Blob(["1"], { type: "image/png" })),
    ),
  };
  const ctx: any = {
    canvas: canvas as unknown as HTMLCanvasElement,
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    arcTo: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    drawImage: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    measureText: jest.fn(
      (text: string) => ({ width: text.length * 10 } as TextMetrics),
    ),
    setLineDash: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    createLinearGradient: jest.fn(() => new MockCanvasGradient()),
    createRadialGradient: jest.fn(() => new MockCanvasGradient()),
    createPattern: jest.fn(() => new MockCanvasPattern()),
    wrapText: jest.fn(() => ({ lineNumber: 1 })),
  };
  return ctx as CanvasRenderingContext2D;
};

// Mock QRCode
jest.mock("qrcode", () => ({
  toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,mockQRCode"),
}));

// Mock imgUtils
jest.mock("../utils/imgUtils", () => ({
  loadImage: jest.fn(async () => {
    const img = new Image();
    Object.defineProperty(img, "width", { value: 100 });
    Object.defineProperty(img, "height", { value: 100 });
    return img;
  }),
  getImageData: jest.fn(),
}));

describe("DrawPoster Features", () => {
  test("Layer System: addLayer and render", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    poster.addLayer({
      type: "rect",
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      fillStyle: "red",
      zIndex: 1,
    });

    poster.addLayer({
      type: "text",
      text: "Hello",
      x: 10,
      y: 10,
      zIndex: 2,
    });

    await poster.render();

    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalled();
  });

  test("Plugin System: use plugin hooks", async () => {
    const ctx = createMockContext();
    const options = { ratio: 1 };
    const poster = createDrawPoster(ctx, options);

    const beforeDraw = jest.fn();
    const afterDraw = jest.fn();
    const onInit = jest.fn();

    const plugin: DrawPosterPlugin = {
      name: "test-plugin",
      beforeDraw,
      afterDraw,
      onInit,
    };

    poster.use(plugin);
    expect(onInit).toHaveBeenCalledWith(ctx, options);

    await poster.render();
    expect(beforeDraw).toHaveBeenCalledWith(ctx, expect.any(Array), options);
    expect(afterDraw).toHaveBeenCalledWith(ctx, expect.any(Array), options);
  });

  test("Gradient Support", () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    poster.drawRect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fillStyle: {
        type: "linear",
        x0: 0,
        y0: 0,
        x1: 100,
        y1: 100,
        stops: [
          { offset: 0, color: "red" },
          { offset: 1, color: "blue" },
        ],
      },
    });

    expect(ctx.createLinearGradient).toHaveBeenCalled();
  });

  test("QRCode Generation", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    await poster.drawQRCode({
      text: "https://example.com",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    // drawQRCode calls QRCode.toDataURL -> loadImage -> ctx.drawImage
    expect(ctx.drawImage).toHaveBeenCalled();
  });

  test("Debug Mode: draws borders", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx, { debug: true });

    poster.addLayer({
      type: "rect",
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      fillStyle: "blue",
    });

    await poster.render();
    // Normal draw
    expect(ctx.fillRect).toHaveBeenCalled();
    // Debug draw (strokeRect is called for rect layer in debug mode)
    expect(ctx.strokeRect).toHaveBeenCalled();
  });
});
