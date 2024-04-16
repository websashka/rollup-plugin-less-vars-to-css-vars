import test from "ava";
import { rollup } from "rollup";
import path, { dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import postcss from "rollup-plugin-postcss";
import { rm } from "node:fs/promises";
const require = createRequire(import.meta.url);
const exportLessVars = require("..");
const __dirname = dirname(fileURLToPath(import.meta.url));

test.afterEach.always('cleanup', async () => {
  try {
    await rm(path.resolve(__dirname, "./fixtures/dist"), { recursive: true, force: true });
  } catch (e) {
    console.log("Error during cleanup!", e)
  }
});

test("test", async (t) => {
  const bundle = await rollup({
    input: path.resolve(__dirname, "./fixtures/index.js"),
    plugins: [
      exportLessVars(),
      postcss({
        extract: true,
      }),
    ],
  });
  const { output } = await bundle.write({
    dir: path.resolve(__dirname, "./fixtures/dist"),
    format: "cjs",
  });
  const expectedCSSOutput = `:root{--white: #ffffff;--black: #000000;--screen-mobile: 700px;--breakpoint-mobile: "screen and (min-width: 700px)";--excluded: 3rem;--ds: #53ea53;}`;

  const variablesFile = output.find(
    (file) => file.fileName === "variables.css"
  );
  t.is(variablesFile.source, expectedCSSOutput);
});

test("excluded folder", async (t) => {
  const bundle = await rollup({
    input: path.resolve(__dirname, "./fixtures/index.js"),
    plugins: [
      exportLessVars({
        exclude: ["test/fixtures/excluded/**"],
      }),
      postcss({
        extract: true,
      }),
    ],
  });
  const { output } = await bundle.write({
    dir: path.resolve(__dirname, "./fixtures/dist"),
    format: "cjs",
  });
  const expectedCSSOutput = `:root{--white: #ffffff;--black: #000000;--screen-mobile: 700px;--breakpoint-mobile: "screen and (min-width: 700px)";--ds: #53ea53;}`;

  const variablesFile = output.find(
    (file) => file.fileName === "variables.css"
  );
  t.is(variablesFile.source, expectedCSSOutput);
});

test("Specific output file", async (t) => {
  const bundle = await rollup({
    input: path.resolve(__dirname, "./fixtures/index.js"),
    plugins: [
      postcss({
        extract: true,
        to: "index.css"
      }),
      exportLessVars({
        output: "index.css"
      }),
    ],
  });
  const { output } = await bundle.write({
    dir: path.resolve(__dirname, "./fixtures/dist"),
    format: "cjs",
  });
  const expectedCSSOutput = `:root{--white: #ffffff;--black: #000000;--screen-mobile: 700px;--breakpoint-mobile: "screen and (min-width: 700px)";--excluded: 3rem;--ds: #53ea53;}
body {
  color: #ffffff;
}
`;

  const variablesFile = output.find(
    (file) => file.fileName === "index.css"
  );
  t.is(variablesFile.source.toString(), expectedCSSOutput);
});
