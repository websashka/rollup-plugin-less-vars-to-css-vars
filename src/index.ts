import type { Plugin } from 'rollup';
import less from 'less';

import type { Options } from '../types';

import { filterByExclude } from './utils';

interface Variable {
  name: string;
  value: string;
}

const extractVariables = (
  input: string,
  { exclude }: { exclude: string[] | RegExp[] }
): Promise<Variable[]> =>
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
            if (filterByExclude(filename, exclude)) {
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
    async load(filePath) {
      if (filePath.endsWith('.less')) {
        const chunkVariables = await extractVariables(`@import "${filePath}";`, {
          exclude: options?.exclude || []
        });
        chunkVariables.forEach((variable) => {
          variables[variable.name] = [variable.value];
        });
      }
    },
    async generateBundle(_, bundle) {
      const content = Object.entries(variables)
        .map(([key, value]) => `--${key}: ${value};`)
        .join('');
      const fileName = options?.output || 'variables.css';

      const existAsset = bundle[fileName];
      if (existAsset && existAsset.type === 'asset') {
        existAsset.source = `:root{${content}}\n${existAsset.source}`;
      }
      if (!existAsset) {
        this.emitFile({
          fileName,
          type: 'asset',
          source: `:root{${content}}`
        });
      }
    }
  };
}
