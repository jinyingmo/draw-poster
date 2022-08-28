// ./`rollup.config.js`

import typescript from "rollup-plugin-typescript";

const plugins = [
  typescript({
    exclude: "node_modules/**",
    typescript: require("typescript")
  }),
]

module.exports = [{
  input: "./src/index.js",
  plugins: [
    ...plugins
  ],
  output: [
    {
      format: "umd",
      file: "dist/index.umd.js",
      sourcemap: true,
      name: "index"
    },
    {
      format: "es",
      file: "dist/index.esm.js",
      sourcemap: true
    }
  ]
}]