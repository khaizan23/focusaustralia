import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;


// import type { NextConfig } from "next";

// const nextConfig = {
//   onDemandEntries: {
//     maxInactiveAge: 25 * 1000,
//     pagesBufferLength: 2,
//   },
// }

// export default nextConfig;
