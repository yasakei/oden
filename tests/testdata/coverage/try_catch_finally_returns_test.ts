import { tryCatchFinally } from "./try_catch_finally_returns.ts";

Oden.test("tryCatchFinally", function () {
  tryCatchFinally(false);
  tryCatchFinally(true);
});
