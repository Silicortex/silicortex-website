import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
