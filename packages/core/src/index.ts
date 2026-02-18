import { createDrawPoster } from './core'
import type DrawPoster from './core/drawPoster'

type DrawPosterOptions = {
  ratio?: number
}

export default function create(ctx: CanvasRenderingContext2D, options: DrawPosterOptions = {}): DrawPoster {
  const drawPoster = createDrawPoster(ctx, options)
  return drawPoster
}
