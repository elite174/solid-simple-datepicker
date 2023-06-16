import withSolid from "rollup-preset-solid";
import copy from "rollup-plugin-copy";
import { createTransform } from "rollup-copy-transform-css";

export default withSolid({
  input: "src/lib/index.ts",
  targets: ["esm", "cjs"],
  plugins: [
    copy({
      targets: [
        {
          src: "src/lib/styles.css",
          dest: "dist",
          transform: createTransform({ minify: true }),
        },
      ],
    }),
  ],
});
