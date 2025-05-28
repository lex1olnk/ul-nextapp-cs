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
      {
        protocol: "https",
        hostname: "distribution.faceit-cdn.net",
        port: "",
        pathname: "/images/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "assets.faceit-cdn.net",
        port: "",
        pathname: "/avatars/**",
        search: "",
      },
    ],
  },
  /* config options here */

};

export default nextConfig;
