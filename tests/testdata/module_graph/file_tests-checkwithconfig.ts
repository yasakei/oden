import { ServerRequest } from "jsr:@std/http/server";

export default (req: ServerRequest) => {
  req.respond({ body: `Hello, from Oden v${Oden.version.oden}!` });
};
