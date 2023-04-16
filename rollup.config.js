import withSolid from "rollup-preset-solid";
import copy from "rollup-plugin-copy";

export default withSolid({
  input: "src/lib/index.ts",
  targets: ["esm", "cjs"],
  plugins: [
    copy({
      targets: [{ src: "src/lib/styles.css", dest: "dist" }],
    }),
  ],
});
