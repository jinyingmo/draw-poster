import path from "path";

const config = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  babel: async (options: { presets?: unknown[] }) => {
    options.presets = options.presets || [];
    options.presets.push(require.resolve("@babel/preset-typescript"));
    return options;
  },
  webpackFinal: async (config: {
    resolve?: { alias?: Record<string, string> };
  }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      core: path.resolve(__dirname, "../packages/core/src"),
    };
    return config;
  },
};

export default config;
