/** @type {import('next').NextConfig} */
const backendOrigin =
  process.env.BACKEND_PROXY_TARGET || "http://127.0.0.1:3340";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/health", destination: `${backendOrigin}/health` },
      { source: "/openapi.json", destination: `${backendOrigin}/openapi.json` },
      { source: "/swagger.json", destination: `${backendOrigin}/swagger.json` },
      { source: "/swagger", destination: `${backendOrigin}/swagger` },
      {
        source: "/swagger-ui/:path*",
        destination: `${backendOrigin}/swagger-ui/:path*`,
      },
      { source: "/api/:path*", destination: `${backendOrigin}/api/:path*` },
    ];
  },
};

export default nextConfig;
