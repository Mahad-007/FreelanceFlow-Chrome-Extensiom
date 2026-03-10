import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, writeFileSync } from "fs";

function copyAssetsPlugin() {
  return {
    name: "copy-extension-assets",
    closeBundle() {
      // Copy icons
      mkdirSync(resolve(__dirname, "dist/icons"), { recursive: true });
      for (const size of [16, 48, 128]) {
        copyFileSync(
          resolve(__dirname, `src/assets/icons/icon${size}.png`),
          resolve(__dirname, `dist/icons/icon${size}.png`)
        );
      }

      // Write production manifest
      const manifest = {
        manifest_version: 3,
        name: "FreelanceFlow",
        version: "1.0.0",
        description:
          "AI-powered freelance assistant for Upwork — score jobs, generate proposals, improve your profile, and get chat suggestions.",
        permissions: ["storage", "activeTab", "sidePanel"],
        host_permissions: [
          "https://www.upwork.com/*",
          "https://openrouter.ai/*",
          "https://api.github.com/*",
          "https://raw.githubusercontent.com/*",
          "https://*/*",
        ],
        background: {
          service_worker: "background/service-worker.js",
          type: "module",
        },
        content_scripts: [
          {
            matches: ["https://www.upwork.com/*"],
            js: ["content/index.js"],
            run_at: "document_idle",
          },
        ],
        side_panel: {
          default_path: "src/sidepanel/index.html",
        },
        action: {
          default_popup: "src/popup/index.html",
          default_icon: {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png",
          },
        },
        icons: {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png",
        },
      };

      writeFileSync(
        resolve(__dirname, "dist/manifest.json"),
        JSON.stringify(manifest, null, 2)
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), copyAssetsPlugin()],
  base: "",  // Use relative paths for extension compatibility
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "src/sidepanel/index.html"),
        popup: resolve(__dirname, "src/popup/index.html"),
        "service-worker": resolve(__dirname, "src/background/service-worker.ts"),
        content: resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "service-worker")
            return "background/service-worker.js";
          if (chunk.name === "content") return "content/index.js";
          if (chunk.name === "popup") return "popup/popup.js";
          if (chunk.name === "sidepanel") return "sidepanel/sidepanel.js";
          return "[name].js";
        },
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
