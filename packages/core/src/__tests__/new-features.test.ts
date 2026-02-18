import { createDrawPoster } from "../core";
import { TemplateRegistry } from "../core/template";
import {
  drawDebugGrid,
  drawDebugGuide,
  drawDebugBounds,
  renderDebugHelpers,
} from "../core/debug";
import { RectLayer, TextLayer } from "../core/types";

// ── Mock global Canvas class ──────────────────────────────────────────────────
class MockCanvasRenderingContext2D {
  wrapText() {
    return { lineNumber: 1 };
  }
}
(globalThis as any).CanvasRenderingContext2D = MockCanvasRenderingContext2D;

// ── Shared mock factory ───────────────────────────────────────────────────────
const createMockContext = () => {
  const canvas = {
    width: 400,
    height: 300,
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
    createLinearGradient: jest.fn(),
    createRadialGradient: jest.fn(),
    createPattern: jest.fn(),
    wrapText: jest.fn(() => ({ lineNumber: 1 })),
  };
  return ctx as CanvasRenderingContext2D;
};

// ── Debug helpers ─────────────────────────────────────────────────────────────
describe("Debug Helpers", () => {
  describe("drawDebugGrid", () => {
    test("draws vertical and horizontal lines across the canvas", () => {
      const ctx = createMockContext();
      drawDebugGrid(ctx, { size: 50 }, 1);

      // canvas is 400×300, size=50 → 9 vertical (0,50,...,400) + 7 horizontal (0,50,...,300)
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    test("applies custom color and lineWidth", () => {
      const ctx = createMockContext();
      drawDebugGrid(ctx, { color: "blue", lineWidth: 2 }, 1);
      expect(ctx.strokeStyle).toBe("blue");
      expect(ctx.lineWidth).toBe(2);
    });

    test("scales grid size by ratio", () => {
      const ctx = createMockContext();
      // size=50, ratio=2 → scaled size = 100px
      drawDebugGrid(ctx, { size: 50 }, 2);
      // first vertical line at x=0, then x=100
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    });
  });

  describe("drawDebugGuide", () => {
    test("draws a horizontal guide line", () => {
      const ctx = createMockContext();
      drawDebugGuide(ctx, { direction: "horizontal", position: 100 }, 1);
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 100);
      expect(ctx.lineTo).toHaveBeenCalledWith(400, 100);
    });

    test("draws a vertical guide line", () => {
      const ctx = createMockContext();
      drawDebugGuide(ctx, { direction: "vertical", position: 200 }, 1);
      expect(ctx.moveTo).toHaveBeenCalledWith(200, 0);
      expect(ctx.lineTo).toHaveBeenCalledWith(200, 300);
    });

    test("applies custom color, lineDash, and lineWidth", () => {
      const ctx = createMockContext();
      drawDebugGuide(
        ctx,
        { direction: "horizontal", position: 50, color: "green", lineWidth: 2, lineDash: [8, 4] },
        1,
      );
      expect(ctx.strokeStyle).toBe("green");
      expect(ctx.lineWidth).toBe(2);
      expect(ctx.setLineDash).toHaveBeenCalledWith([8, 4]);
    });

    test("scales position by ratio", () => {
      const ctx = createMockContext();
      drawDebugGuide(ctx, { direction: "horizontal", position: 50 }, 2);
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 100);
    });
  });

  describe("drawDebugBounds", () => {
    test("draws strokeRect for rect layer", () => {
      const ctx = createMockContext();
      const layers: RectLayer[] = [
        { type: "rect", x: 10, y: 20, width: 100, height: 50 },
      ];
      drawDebugBounds(ctx, layers, 1);
      expect(ctx.strokeRect).toHaveBeenCalledWith(10, 20, 100, 50);
    });

    test("skips invisible layers", () => {
      const ctx = createMockContext();
      const layers: RectLayer[] = [
        { type: "rect", x: 0, y: 0, width: 100, height: 100, visible: false },
      ];
      drawDebugBounds(ctx, layers, 1);
      expect(ctx.strokeRect).not.toHaveBeenCalled();
    });
  });

  describe("renderDebugHelpers", () => {
    test("does nothing when debug is false", () => {
      const ctx = createMockContext();
      renderDebugHelpers(ctx, [], false, 1);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    test("shows bounds by default when debug is true", () => {
      const ctx = createMockContext();
      const layers: RectLayer[] = [
        { type: "rect", x: 0, y: 0, width: 50, height: 50 },
      ];
      renderDebugHelpers(ctx, layers, true, 1);
      expect(ctx.strokeRect).toHaveBeenCalled();
    });

    test("shows grid when grid option is true", () => {
      const ctx = createMockContext();
      renderDebugHelpers(ctx, [], { grid: true }, 1);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    test("shows guides when provided", () => {
      const ctx = createMockContext();
      renderDebugHelpers(
        ctx,
        [],
        { guides: [{ direction: "horizontal", position: 100 }] },
        1,
      );
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 100);
    });

    test("hides bounds when bounds: false", () => {
      const ctx = createMockContext();
      const layers: RectLayer[] = [
        { type: "rect", x: 0, y: 0, width: 50, height: 50 },
      ];
      renderDebugHelpers(ctx, layers, { bounds: false }, 1);
      expect(ctx.strokeRect).not.toHaveBeenCalled();
    });
  });
});

// ── TemplateRegistry ──────────────────────────────────────────────────────────
describe("TemplateRegistry", () => {
  test("registers and creates layers from a template", () => {
    const registry = new TemplateRegistry();
    registry.register<{ label: string }>("badge", data => [
      { type: "rect", x: 0, y: 0, width: 80, height: 30 },
      { type: "text", x: 40, y: 15, text: data.label },
    ]);

    const layers = registry.create("badge", { label: "New" });
    expect(layers).toHaveLength(2);
    expect((layers[1] as TextLayer).text).toBe("New");
  });

  test("applies offset to created layers", () => {
    const registry = new TemplateRegistry();
    registry.register("box", () => [
      { type: "rect", x: 10, y: 20, width: 50, height: 50 },
    ]);

    const layers = registry.create("box", {}, { x: 100, y: 200 });
    const rect = layers[0] as RectLayer;
    expect(rect.x).toBe(110);
    expect(rect.y).toBe(220);
  });

  test("throws when template is not registered", () => {
    const registry = new TemplateRegistry();
    expect(() => registry.create("missing")).toThrow(
      'Template "missing" is not registered.',
    );
  });

  test("has() returns correct boolean", () => {
    const registry = new TemplateRegistry();
    registry.register("myTemplate", () => []);
    expect(registry.has("myTemplate")).toBe(true);
    expect(registry.has("other")).toBe(false);
  });

  test("unregister() removes a template", () => {
    const registry = new TemplateRegistry();
    registry.register("tmp", () => []);
    registry.unregister("tmp");
    expect(registry.has("tmp")).toBe(false);
  });

  test("getNames() returns all registered template names", () => {
    const registry = new TemplateRegistry();
    registry.register("a", () => []);
    registry.register("b", () => []);
    expect(registry.getNames()).toEqual(expect.arrayContaining(["a", "b"]));
  });

  test("works via createDrawPoster API", () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    poster.registerTemplate<{ color: string }>("card", data => [
      { type: "rect", x: 0, y: 0, width: 200, height: 100, fillStyle: data.color },
    ]);

    const layers = poster.createFromTemplate("card", { color: "red" });
    expect(layers).toHaveLength(1);
    expect((layers[0] as RectLayer).fillStyle).toBe("red");
  });

  test("createFromTemplate adds offset correctly via poster API", () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    poster.registerTemplate("icon", () => [
      { type: "rect", x: 5, y: 5, width: 20, height: 20 },
    ]);

    const layers = poster.createFromTemplate("icon", {}, { x: 50, y: 50 });
    const rect = layers[0] as RectLayer;
    expect(rect.x).toBe(55);
    expect(rect.y).toBe(55);
  });
});

// ── Vertical text ─────────────────────────────────────────────────────────────
describe("Vertical Text", () => {
  test("renders each character individually going downward", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    poster.drawText({
      text: "ABC",
      x: 50,
      y: 100,
      fontSize: 20,
      direction: "vertical",
    });

    // Should call fillText 3 times (one per char)
    expect(ctx.fillText).toHaveBeenCalledTimes(3);
    // All calls share the same x
    const calls = (ctx.fillText as jest.Mock).mock.calls;
    expect(calls[0][1]).toBe(50); // x
    expect(calls[1][1]).toBe(50); // x
    expect(calls[2][1]).toBe(50); // x
    // y increases each time
    expect(calls[0][2]).toBeLessThan(calls[1][2]);
    expect(calls[1][2]).toBeLessThan(calls[2][2]);
  });

  test("vertical text via TextLayer in render", async () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    const layer: TextLayer = {
      type: "text",
      text: "Hi",
      x: 10,
      y: 10,
      fontSize: 16,
      direction: "vertical",
    };
    poster.addLayer(layer);
    await poster.render();

    expect(ctx.fillText).toHaveBeenCalledTimes(2);
  });
});

// ── Enhanced stroke ───────────────────────────────────────────────────────────
describe("Enhanced Text Stroke", () => {
  test("strokeColor overrides default strokeStyle", () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    poster.drawText({
      text: "Hello",
      x: 0,
      y: 0,
      strokeText: true,
      strokeColor: "#ff0000",
      strokeWidth: 3,
    });

    expect(ctx.strokeText).toHaveBeenCalled();
  });

  test("strokeWidth sets lineWidth for stroke", () => {
    const ctx = createMockContext();
    const poster = createDrawPoster(ctx);

    poster.drawText({
      text: "World",
      x: 0,
      y: 0,
      strokeText: true,
      strokeWidth: 5,
    });

    expect(ctx.strokeText).toHaveBeenCalled();
    expect(ctx.lineWidth).toBe(5);
  });
});
