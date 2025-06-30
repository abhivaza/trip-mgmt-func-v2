import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // adjust to your entry file
  outDir: "lib",
  target: "node18",
  format: ["cjs"],
  sourcemap: true,
  clean: true,
  dts: true,
});
