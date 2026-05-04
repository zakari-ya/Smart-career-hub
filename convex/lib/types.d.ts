declare module 'pdf-parse/lib/pdf-parse.js' {
  function pdf(dataBuffer: Buffer, options?: unknown): Promise<unknown>;
  export = pdf;
}
