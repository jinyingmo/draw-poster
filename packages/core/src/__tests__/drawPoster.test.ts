import createDrawPoster from '..'
import { loadImage } from '../utils/imgUtils'

class MockCanvasRenderingContext2D {}

(globalThis as unknown as { CanvasRenderingContext2D: typeof MockCanvasRenderingContext2D }).CanvasRenderingContext2D =
  MockCanvasRenderingContext2D

jest.mock('../utils/imgUtils', () => ({
  loadImage: jest.fn(async () => {
    const img = new Image()
    Object.defineProperty(img, 'width', { value: 120 })
    Object.defineProperty(img, 'height', { value: 80 })
    return img
  }),
  getImageData: jest.fn()
}))

const createMockContext = () => {
  const canvas = {
    width: 0,
    height: 0,
    style: {} as Record<string, string>,
    toDataURL: jest.fn(() => 'data:image/png;base64,xxx'),
    toBlob: jest.fn((callback: (blob: Blob | null) => void) =>
      callback(new Blob(['1'], { type: 'image/png' }))
    )
  }
  const ctx: Partial<CanvasRenderingContext2D> = {
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
    measureText: jest.fn((text: string) => ({ width: text.length * 10 } as TextMetrics)),
    setLineDash: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    wrapText: jest.fn(() => ({ lineNumber: 1 }))
  }
  return ctx as CanvasRenderingContext2D
}

describe('drawPoster core', () => {
  test('setSize applies ratio to canvas size', () => {
    const ctx = createMockContext()
    const poster = createDrawPoster(ctx, { ratio: 2 })
    poster.setSize(100, 50)
    expect(ctx.canvas.width).toBe(200)
    expect(ctx.canvas.height).toBe(100)
  })

  test('drawRect uses scaled dimensions', () => {
    const ctx = createMockContext()
    const poster = createDrawPoster(ctx, { ratio: 2 })
    poster.drawRect({ x: 2, y: 3, width: 10, height: 6, fillStyle: '#fff' })
    expect(ctx.fillRect).toHaveBeenCalledWith(4, 6, 20, 12)
  })

  test('drawText applies font and fills text', () => {
    const ctx = createMockContext()
    const poster = createDrawPoster(ctx, { ratio: 1 })
    poster.drawText({ text: 'hello', x: 0, y: 0, fontSize: 20, color: '#000' })
    expect(ctx.fillText).toHaveBeenCalled()
    expect(ctx.font).toContain('20px')
  })

  test('drawImage loads image and draws with ratio', async () => {
    const ctx = createMockContext()
    const poster = createDrawPoster(ctx, { ratio: 2 })
    await poster.drawImage({ source: 'https://img.test/1.png', x: 1, y: 2, width: 10, height: 20 })
    expect(loadImage).toHaveBeenCalled()
    expect(ctx.drawImage).toHaveBeenCalled()
  })

  test('export methods call canvas APIs', async () => {
    const ctx = createMockContext()
    const poster = createDrawPoster(ctx, { ratio: 1 })
    const dataUrl = poster.exportDataURL()
    expect(dataUrl).toContain('data:image/png')
    await expect(poster.exportBlob()).resolves.toBeInstanceOf(Blob)
  })
})
