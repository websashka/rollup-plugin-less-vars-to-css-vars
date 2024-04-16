[npm]: https://img.shields.io/npm/v/rollup-plugin-less-vars-to-css-vars
[npm-url]: https://www.npmjs.com/package/rollup-plugin-less-vars-to-css-vars
[size]: https://packagephobia.now.sh/badge?p=rollup-plugin-less-vars-to-css-vars
[size-url]: https://packagephobia.now.sh/result?p=rollup-plugin-less-vars-to-css-vars

[![npm][npm]][npm-url]
[![size][size]][size-url]
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

# rollup-plugin-less-vars-to-css-vars

Less-to-CSS Variable Aggregator is an intelligent plugin designed to automate the process of converting variables from Less to CSS. It scans your project for all declared variables in Less files and transforms them into readable CSS variables. This plugin not only simplifies style management but also ensures more efficient use of variables, reducing development time and improving overall code structure.

## Requirements

This plugin requires an [LTS](https://github.com/nodejs/Release) Node version (v14.0.0+) and Rollup v1.20.0+.

## Install

```bash
npm install rollup-plugin-less-vars-to-css-vars --save-dev
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import { exportLessVars } from "rollup-plugin-less-vars-to-css-vars";
const config = {
  input: "src/index.js",
  output: {
    dir: "output",
    format: "es",
  },
  plugins: [exportLessVars({ output: "theme.css" })],
};

export default config;
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

### `exclude`

Type: `Array[...String|RegExp]`<br>

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files in the build the plugin should _ignore_.

### `output`

Type: `String`<br>
Default: `variables.css`<br>

CSS filename

### Example

```js
import { exportLessVars } from "rollup-plugin-less-vars-to-css-vars";
const config = {
  input: "src/index.js",
  output: {
    dir: "output",
    format: "es",
  },
  plugins: [exportLessVars({ output: "theme.css" })],
};

export default config;
```

```less
@primary-color: #0000ff;
@text-color: #594c4a;

body {
  color: @text-color;
}
```

```css
/* theme.less */
:root {
  --primary-color: #0000ff;
  --text-color: #594c4a;
}
```

## Meta

[LICENSE (MIT)](/LICENSE)
