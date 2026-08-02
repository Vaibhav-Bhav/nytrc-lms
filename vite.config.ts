// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Hard-pin to node-server so `node .output/server/index.mjs` binds an HTTP
  // listener and works under PM2. The Lovable sandbox overrides this to
  // cloudflare-module automatically when LOVABLE_SANDBOX=1, so Lovable CI
  // is unaffected. See: LovableViteTanstackOptions.nitro in the config pkg.
  nitro: { preset: "node-server" },
});
