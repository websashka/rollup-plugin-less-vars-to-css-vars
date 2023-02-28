declare module 'less' {
  export function parse(
    input: string,
    options: any,
    callback: (err: any, root: any, _: any, options: any) => void
  ): void;
  export const contexts: any;
}
