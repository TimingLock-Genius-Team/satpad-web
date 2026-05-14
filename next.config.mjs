/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@react-native-async-storage\/async-storage/,
      })
    );
    return config;
  },
};

export default nextConfig;
