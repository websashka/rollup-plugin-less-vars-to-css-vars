import path from 'path';

import less from 'less';
import type { Plugin } from 'rollup';

import type { Options } from '../types';

interface Variable {
  name: string;
  value: string;
}

const extractVariables = (input: string, options: any): Promise<Variable[]> =>
  new Promise((resolve, reject) => {
    less.parse(input, options, (err: any, root: any, _: any, params: any) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const ctx = new less.contexts.Eval(params, [root]);

        root.eval(ctx);

        const variables = root.variables();
        const result = Object.keys(variables).map((key) => {
          const variable = root.variable(key);
          const value = variable.value.eval(ctx);

          return {
            name: key.substr(1),
            value: value.toCSS(ctx)
          };
        }, {});

        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  });

const getVars = (source: string) =>
  extractVariables(`@import "${path.resolve(process.cwd(), source)}";`, {
    javascriptEnabled: true
  }).then((variables) =>
    variables.reduce((acc, variable) => {
      return {
        ...acc,
        [variable.name]: variable.value
      };
    }, {})
  );

export default function exportLessVars({ source, destination = 'style.css' }: Options): Plugin {
  return {
    name: 'less-vars-to-css-vars',
    async generateBundle(_, bundles) {
      const variables = await getVars(source);
      Object.values(bundles).forEach((bundle) => {
        if (bundle.type === 'asset' && bundle.name === destination) {
          this.emitFile({
            ...bundle,
            source: `${bundle.source}:root{${Object.entries(variables)
              .map(([key, value]) => `--${key}: ${value};`)
              .join('')}}`
          });
        }
      });
    }
  };
}
