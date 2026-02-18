import { createDrawPoster } from "../core";
import { TextLayer, TextSpan } from "../core/types";
import { loadFont } from "../utils/font";

// Mock Canvas Context globally
class MockCanvasRenderingContext2D {
  wrapText() {
    return { lineNumber: 1 };
  }
  measureText(text: string) {
    return { width: text.length * 10 };
  }
}
const globalAny = globalThis as any;
globalAny.CanvasRenderingContext2D = MockCanvasRenderingContext2D;

// Mock FontFace
globalAny.FontFace = class {
  constructor(public family: string, public source: string, public descriptors: any) {}
  load() {
    return Promise.resolve();
  }
};

// Mock document.fonts
if (typeof document !== 'undefined') {
  // Check if fonts property exists or is configurable
  Object.defineProperty(document, 'fonts', {
    value: {
      add: jest.fn(),
    },
    writable: true,
    configurable: true,
  });
} else {
  globalAny.document = {
    fonts: {
      add: jest.fn(),
    },
  };
}

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
    strokeText: jest.fn(),
    measureText: jest.fn((text: string) => ({ width: text.length * 10 })),
    setLineDash: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    createLinearGradient: jest.fn(),
    createRadialGradient: jest.fn(),
    createPattern: jest.fn(),
  };
  return ctx as CanvasRenderingContext2D;
};

describe("Rich Text Features", () => {
  test("Font Loading", async () => {
    await loadFont({
      family: "MyFont",
      source: "https://example.com/font.ttf",
    });
    expect(globalAny.document.fonts.add).toHaveBeenCalled();
  });

  test("Rich Text Rendering", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);
    
    const spans: TextSpan[] = [
      { text: "Hello", color: "red", fontSize: 20 },
      { text: " World", color: "blue", fontSize: 30 },
    ];

    const layer: TextLayer = {
      type: "text",
      text: "Hello World", // Fallback text
      spans,
      x: 10,
      y: 10,
    };
    poster.addLayer(layer);
    
    await poster.render();
    
    // Check if fillText was called for each span segment
    // "Hello" -> fillText("Hello", ...)
    // " World" -> fillText(" World", ...)
    
    expect(ctx.fillText).toHaveBeenCalledWith("Hello", expect.any(Number), expect.any(Number));
    expect(ctx.fillText).toHaveBeenCalledWith(" World", expect.any(Number), expect.any(Number));
    
    // Check styles?
    // Since calls are sequential and ctx.fillStyle is set before each call
    // We can't easily check ctx state at the exact moment without mock implementation tracking.
    // But we verified call arguments.
  });

  test("Rich Text Line Wrapping", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);
    
    const spans: TextSpan[] = [
      { text: "This is a long text that should wrap", fontSize: 10 },
    ];
    
    // Each char is 10px wide.
    // "This is a long text that should wrap" is 36 chars = 360px.
    // Max width 100px -> should wrap.
    
    const layer: TextLayer = {
      type: "text",
      text: "",
      spans,
      x: 0,
      y: 0,
      maxWidth: 100,
    };
    poster.addLayer(layer);
    
    await poster.render();
    
    // Should have multiple fillText calls for segments
    const calls = (ctx.fillText as jest.Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(1);
  });
  
  test("Letter Spacing", async () => {
     const ctx = createMockContext();
     const poster = createDrawPoster(ctx);
     
     const spans: TextSpan[] = [
       { text: "ABC", letterSpacing: 5 },
     ];
     
     const layer: TextLayer = {
       type: "text",
       text: "",
       spans,
       x: 0,
       y: 0,
     };
     poster.addLayer(layer);
     
     await poster.render();
     
     // ABC with letter spacing -> fillText("A"), fillText("B"), fillText("C")
     expect(ctx.fillText).toHaveBeenCalledWith("A", expect.any(Number), expect.any(Number));
     expect(ctx.fillText).toHaveBeenCalledWith("B", expect.any(Number), expect.any(Number));
     expect(ctx.fillText).toHaveBeenCalledWith("C", expect.any(Number), expect.any(Number));
  });
});
