import { createDrawPoster } from "../core";
import { RectLayer, CircleLayer } from "../core/types";

// Mock Canvas Context globally
class MockCanvasRenderingContext2D {
  wrapText() {
    return { lineNumber: 1 };
  }
}
const globalAny = globalThis as any;
globalAny.CanvasRenderingContext2D = MockCanvasRenderingContext2D;

// Mock Canvas Context
const createMockContext = () => {
  const canvas = {
    width: 800,
    height: 600,
    style: {} as Record<string, string>,
    toDataURL: jest.fn(),
    toBlob: jest.fn(),
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
    rect: jest.fn(),
    clip: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    drawImage: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(
      (text: string) => ({ width: text.length * 10 } as TextMetrics),
    ),
    setLineDash: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    createLinearGradient: jest.fn(),
    createRadialGradient: jest.fn(),
    createPattern: jest.fn(),
    wrapText: jest.fn(() => ({ lineNumber: 1 })),
  };
  return ctx as CanvasRenderingContext2D;
};

describe("Advanced Features", () => {
  test("Global Composite Operation (Blend Mode)", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    const layer: RectLayer = {
      type: "rect",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      globalCompositeOperation: "multiply",
    };
    poster.addLayer(layer);

    await poster.render();

    expect(ctx.globalCompositeOperation).toBe("multiply");
  });

  test("Filter Support", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    const layer: RectLayer = {
      type: "rect",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      filter: "blur(5px)",
    };
    poster.addLayer(layer);

    await poster.render();

    expect(ctx.filter).toBe("blur(5px)");
  });

  test("Masking Support", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    const maskLayer: CircleLayer = {
      type: "circle",
      x: 50,
      y: 50,
      radius: 50,
    };

    const layer: RectLayer = {
      type: "rect",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      mask: maskLayer,
    };
    poster.addLayer(layer);

    await poster.render();

    // Verify sequence: save -> create path (arc) -> clip -> draw rect -> restore
    // Note: createLayerPath calls beginPath

    // Check if clip was called
    expect(ctx.clip).toHaveBeenCalled();

    // Check if arc was called (for mask)
    expect(ctx.arc).toHaveBeenCalledWith(50, 50, 50, 0, Math.PI * 2);

    // Check save/restore count
    // render() calls save/restore for debug? No, only if debug=true
    // But withContext calls save/restore for style application.
    // Mask logic adds another pair of save/restore.
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  test("Scale9Grid Support", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    // Mock Image Element
    const mockImage = {
      width: 100,
      height: 100,
    } as HTMLImageElement;

    const layer: any = {
      type: "image",
      image: mockImage,
      x: 0,
      y: 0,
      width: 200, // Stretched width
      height: 200, // Stretched height
      scale9Grid: [10, 10, 10, 10], // 10px borders
    };
    poster.addLayer(layer);

    await poster.render();

    // Should call drawImage 9 times (3x3 grid)
    // The implementation iterates 3x3.
    // However, if width/height of a slice is 0, it skips.
    // Here 10, 10, 10 means 10, 80, 10 slices for source (total 100)
    // And 10, 180, 10 slices for dest (total 200)
    // All dimensions > 0, so should be 9 calls.

    expect(ctx.drawImage).toHaveBeenCalledTimes(9);
  });
});
