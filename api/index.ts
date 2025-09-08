// minimal, no extra types needed
const { handler } = require('../dist/serverless');
export default async function (req: any, res: any) {
  return handler(req, res);
}
