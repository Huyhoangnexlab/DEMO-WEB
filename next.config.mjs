/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cho phép Nexlab Hub nhúng trang này trong WebContentsView.
  async headers() {
    return [{
      source: "/:path*",
      headers: [{ key: "X-Nexlab-App", value: "hr-demo/1.0" }],
    }];
  },
};
export default nextConfig;
