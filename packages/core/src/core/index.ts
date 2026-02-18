import DrawPoster from './drawPoster'

type CreateOptions = {
  ratio?: number
}

export const createDrawPoster = (ctx: CanvasRenderingContext2D, { ratio = 1 }: CreateOptions = {}): DrawPoster => {
  const drawPoster = new DrawPoster(ctx, { ratio })
  return drawPoster
}
