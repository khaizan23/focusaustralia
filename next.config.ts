import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
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
