import { createDrawPoster } from "../core";
import { RectLayer } from "../core/types";

// Mock Canvas Context
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

const createMockContext = (width = 800, height = 600) => {
  const canvas = {
    width,
    height,
    style: {} as Record<string, string>,
    toDataURL: jest.fn(),
    toBlob: jest.fn(),
  };
  const ctx: any = {
    canvas: canvas as unknown as HTMLCanvasElement,
    save: jest.fn(),
    restore: jest.fn(),
    measureText: jest.fn((text: string) => ({ width: text.length * 10 } as TextMetrics)),
    wrapText: jest.fn(() => ({ lineNumber: 1 })),
  };
  return ctx as CanvasRenderingContext2D;
};

describe("Layout Features", () => {
  test("Align single layer to canvas", () => {
    const ctx = createMockContext(800, 600);
    const poster = createDrawPoster(ctx);
    const layer: RectLayer = {
      type: "rect",
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      id: "r1",
    };
    poster.addLayer(layer);

    // Align Left -> x=0
    poster.align("left", ["r1"]);
    expect(layer.x).toBe(0);

    // Align Center -> x = (800-50)/2 = 375
    poster.align("center", ["r1"]);
    expect(layer.x).toBe(375);

    // Align Right -> x = 800-50 = 750
    poster.align("right", ["r1"]);
    expect(layer.x).toBe(750);

    // Align Top -> y=0
    poster.align("top", ["r1"]);
    expect(layer.y).toBe(0);

    // Align Middle -> y = (600-50)/2 = 275
    poster.align("middle", ["r1"]);
    expect(layer.y).toBe(275);

    // Align Bottom -> y = 600-50 = 550
    poster.align("bottom", ["r1"]);
    expect(layer.y).toBe(550);
  });

  test("Align multiple layers", () => {
    const ctx = createMockContext(800, 600);
    const poster = createDrawPoster(ctx);
    const r1: RectLayer = {
      type: "rect",
      x: 10,
      y: 10,
      width: 50,
      height: 50,
      id: "r1",
    };
    const r2: RectLayer = {
      type: "rect",
      x: 100,
      y: 50,
      width: 50,
      height: 50,
      id: "r2",
    };
    poster.addLayer(r1);
    poster.addLayer(r2);

    // Align Left -> Min X = 10. Both align to 10.
    poster.align("left", ["r1", "r2"]);
    expect(r1.x).toBe(10);
    expect(r2.x).toBe(10);

    // Reset
    r1.x = 10;
    r2.x = 100;

    // Align Center -> Bounds: 10..150 (r1: 10+50=60, r2: 100+50=150. MaxX=150).
    // Center of bounds = 10 + (150-10)/2 = 80.
    // r1 center should be 80. r1.x = 80 - 25 = 55.
    // r2 center should be 80. r2.x = 80 - 25 = 55.
    poster.align("center", ["r1", "r2"]);
    expect(r1.x).toBe(55);
    expect(r2.x).toBe(55);
  });

  test("Distribute layers horizontally", () => {
    const ctx = createMockContext(800, 600);
    const poster = createDrawPoster(ctx);
    const r1: RectLayer = {
      type: "rect",
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      id: "r1",
    };
    const r2: RectLayer = {
      type: "rect",
      x: 50,
      y: 0,
      width: 50,
      height: 50,
      id: "r2",
    }; // Center 75
    const r3: RectLayer = {
      type: "rect",
      x: 250,
      y: 0,
      width: 50,
      height: 50,
      id: "r3",
    }; // Center 275
    poster.addLayer(r1);
    poster.addLayer(r2);
    poster.addLayer(r3);

    // r1 center: 25. r3 center: 275.
    // Total span = 250. Step = 250 / 2 = 125.
    // Target r2 center = 25 + 125 = 150.
    // r2.x should be 150 - 25 = 125.

    poster.distribute("horizontal", ["r1", "r2", "r3"]);
    expect(r1.x).toBe(0);
    expect(r3.x).toBe(250);
    expect(r2.x).toBe(125);
  });
});
