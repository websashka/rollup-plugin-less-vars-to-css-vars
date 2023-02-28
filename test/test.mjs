import test from "ava";
import { rollup } from "rollup";
import path from "node:path";
import { createRequire } from "module";

test("test", (t) => {
  const require = createRequire(import.meta.url);
  const exportLessVars = require("current-package");
  rollup({
    input: "dummy-input",
    plugins: [
      exportLessVars({
        source: path.resolve(__dirname, "./fixtures/theme.less"),
      }),
    ],
  });
});
