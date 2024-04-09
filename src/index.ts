import path from 'path';

import type { Plugin } from 'rollup';
import less from 'less';

import type { Options } from '../types';

interface Variable {
  name: string;
  value: string;
}

const extractVariables = (input: string, { exclude }: { exclude: string[] }): Promise<Variable[]> =>
  new Promise((resolve, reject) => {
    less.parse(
      input,
      {
        javascriptEnabled: true
      },
      (err: any, root: any, _: any, params: any) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          const ctx = new less.contexts.Eval(params, [root]);

          root.eval(ctx);
          const variables = root.variables();
          const result = Object.keys(variables).reduce((acc: Variable[], key) => {
            const variable = root.variable(key);
            const value = variable.value.eval(ctx);
            const cssValue = value.toCSS(ctx);
            // eslint-disable-next-line no-underscore-dangle
            const { filename } = variable._fileInfo;
            if (
              exclude.length > 0 &&
              exclude.some((excPath) => path.resolve(filename).startsWith(path.resolve(excPath)))
            ) {
              return acc;
            }
            acc.push({
              name: key.substr(1),
              value: value.quote ? `"${cssValue}"` : cssValue
            });
            return acc;
          }, []);

          resolve(result);
        } catch (e) {
          reject(e);
        }
      }
    );
  });

export default function exportLessVars(options: Options | undefined): Plugin {
  const variables: any = {};
  return {
    name: 'less-vars-to-css-vars',
    async load(path) {
      if (path.endsWith('.less')) {
        const chunkVariables = await extractVariables(`@import "${path}";`, {
          exclude: options?.exclude || []
        });
        chunkVariables.forEach((variable) => {
          variables[variable.name] = [variable.value];
        });
      }
    },
    async generateBundle() {
      const content = Object.entries(variables)
        .map(([key, value]) => `--${key}: ${value};`)
        .join('');
      this.emitFile({
        fileName: 'variables.css',
        type: 'asset',
        source: `:root{${content}}`
      });
    }
  };
}
