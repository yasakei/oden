import * as path from "node:path";

Oden.test(function test() {
  const res = path.join("foo", "bar");
  if (!res.includes("foo")) {
    throw new Error("fail");
  }
});
