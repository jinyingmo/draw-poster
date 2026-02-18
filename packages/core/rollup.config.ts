import typescript from '@rollup/plugin-typescript'

const config = [
  {
    input: './src/index.ts',
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
        name: 'index'
      },
      {
        format: 'es',
        file: 'dist/index.esm.js',
        sourcemap: true
      }
    ]
  }
]

export default config
