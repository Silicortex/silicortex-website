import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The root layout (app/[lang]/layout.tsx) sits on a top-level dynamic
  // segment, which is exactly the case Next's own docs call out as needing
  // `global-not-found.js`: a genuinely unmatched URL (no `lang` segment
  // resolved at all, or a path that matches no route under it) has no
  // layout left to carry a real <html> wrapper, so Next falls back to its
  // built-in bare 404 unless this is enabled. See app/global-not-found.tsx.
  experimental: {
    globalNotFound: true,
  },
  // The invoice and bookkeeping system moved to its own private repo and its own
  // host (admin.silicortex.de). These keep old bookmarks working.
  //
  // Query strings are preserved automatically, so /admin/export?format=json still
  // lands on the right download. The routes are flattened on the new host — / is
  // the app, /login the login — which is why /admin maps to the root and not to
  // /admin there.
  //
  // These land BEFORE the admin subtree is deleted, deliberately: Next gives
  // redirects precedence over pages, so the cutover happens here and can be
  // reverted on its own if anything is wrong with it.
  async redirects() {
    return [
      { source: "/admin", destination: "https://admin.silicortex.de/", permanent: true },
      {
        source: "/admin/:path*",
        destination: "https://admin.silicortex.de/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
