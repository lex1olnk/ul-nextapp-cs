import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.fastcup.net",
        port: "",
        pathname: "/avatars/users/**",
        search: "",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
