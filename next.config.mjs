/**
 * OmniPost Next.js configuration
 *
 * Two build modes:
 * 1. Server mode (default): `npm run build` — full Next.js SSR, all API routes work
 * 2. Static mode: `npm run build:static` — exports static HTML for GitHub Pages, Vercel, etc.
 *
 * Static mode limitations: API routes are not included; workspace/settings/records
 * UI renders but features requiring the server (LLM generation, publishing) won't work.
 * The landing page and documentation are fully functional in both modes.
 */

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  assetPrefix: basePath,

  // Static export: generates pure HTML/CSS/JS (no server needed)
  output: isStaticExport ? "export" : undefined,

  // Skip ESLint in static builds (worktree may conflict with parent .eslintrc.json)
  eslint: isStaticExport ? { ignoreDuringBuilds: true } : undefined,

  // Strips API route files from static output (they would error at build time)
  ...(isStaticExport && {
    trailingSlash: true, // GitHub Pages serves /page/index.html as /page/
  }),

  // Disable Image Optimization in static export (next/image needs a server)
  images: isStaticExport
    ? { unoptimized: true }
    : undefined,

  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
