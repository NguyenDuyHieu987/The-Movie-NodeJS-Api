export const APP_TOKEN_SECRET: string = process.env.APP_TOKEN_SECRET!.replace(
  /\\n/g,
  '\n'
);
export const APP_TOKEN_SECRET_VERIFY: string =
  process.env.APP_TOKEN_SECRET_VERIFY!.replace(/\\n/g, '\n');
