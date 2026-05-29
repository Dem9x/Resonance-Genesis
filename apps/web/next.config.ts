import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config, { webpack }) {
    config.cache = false;
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(@react-native-async-storage\/async-storage|pino-pretty)$/
      })
    );

    return config;
  }
};

export default nextConfig;
