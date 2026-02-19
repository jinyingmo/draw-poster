import type { Layer } from "../../../core/src";

export type EditableLayer = Layer & { id: string };

let _counter = 0;

function newId(type: string): string {
  return `${type}-${Date.now()}-${++_counter}`;
}

export function createDefaultLayer(
  type: string,
  overrides?: Partial<Layer>,
): EditableLayer {
  const id = newId(type);
  const zIndex = Date.now();

  let layer: Partial<Layer> = {};

  switch (type) {
    case "rect":
      layer = {
        type: "rect",
        id,
        zIndex,
        x: 80,
        y: 80,
        width: 120,
        height: 80,
        fillStyle: "#3B82F6",
      };
      break;

    case "circle":
      layer = {
        type: "circle",
        id,
        zIndex,
        x: 160,
        y: 150,
        radius: 50,
        fillStyle: "#EF4444",
      };
      break;

    case "text":
      layer = {
        type: "text",
        id,
        zIndex,
        x: 80,
        y: 100,
        text: "请输入文字",
        fontSize: 24,
        color: "#111827",
      };
      break;

    case "image":
      layer = {
        type: "image",
        id,
        zIndex,
        x: 80,
        y: 80,
        width: 150,
        height: 150,
        image: "https://picsum.photos/150/150",
      };
      break;

    case "qrcode":
      layer = {
        type: "qrcode",
        id,
        zIndex,
        x: 80,
        y: 80,
        width: 100,
        height: 100,
        text: "https://example.com",
      };
      break;

    case "line":
      layer = {
        type: "line",
        id,
        zIndex,
        x1: 50,
        y1: 200,
        x2: 250,
        y2: 200,
        strokeStyle: "#111827",
        lineWidth: 2,
      };
      break;

    case "polygon":
      layer = {
        type: "polygon",
        id,
        zIndex,
        points: [
          [80, 80],
          [160, 80],
          [160, 160],
          [80, 160],
        ],
        fillStyle: "#8B5CF6",
        closePath: true,
      };
      break;
  }

  return { ...layer, ...overrides } as EditableLayer;
}

export const LAYER_TYPE_LABELS: Record<string, string> = {
  rect: "矩形",
  circle: "圆形",
  text: "文本",
  image: "图片",
  qrcode: "二维码",
  line: "线条",
  polygon: "多边形",
};
