import typescript from '@rollup/plugin-typescript'

const config = [
  {
    input: './src/index.ts',
    external: ['qrcode'],
    plugins: [
      typescript({
        exclude: 'node_modules/**',
        tsconfig: './tsconfig.json'
      })
    ],
    output: [
      {
        format: 'umd',
        file: 'dist/index.umd.js',
        sourcemap: true,
        name: 'DrawPoster',
        exports: 'named',
        globals: {
          qrcode: 'QRCode'
        }
      },
      {
        format: 'es',
        file: 'dist/index.esm.js',
        sourcemap: true,
        exports: 'named'
      }
    ]
  }
]

export default config
