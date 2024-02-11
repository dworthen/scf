import { resolve } from "path";

import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["./js/index.ts", "./js/bin.ts"],
  format: ["cjs", "esm"],
  target: "node20",
  shims: true,
  outDir: resolve(__dirname, "./dist-js"),
  treeshake: false,
  splitting: false,
  sourcemap: "inline",
  clean: false,
}));
