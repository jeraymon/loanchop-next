/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forces Static Site Generation (SSG) for AWS Amplify
  output: 'export',
  
  // Ensures URLs end with a slash (e.g., /density/), preventing S3/Amplify routing errors
  trailingSlash: true,
  
  images: {
    // Required for static exports, as the Next.js image optimization server won't be running
    unoptimized: true,
  },
  
  // Keeps your math logic secure and reduces bundle size by not shipping source maps to production
  productionBrowserSourceMaps: false,
};

export default nextConfig;