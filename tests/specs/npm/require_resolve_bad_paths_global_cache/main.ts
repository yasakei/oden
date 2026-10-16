import "npm:@odentest/esm-basic";
import { resolve } from "npm:@odentest/require-resolve";

console.log(resolve("@odentest/esm-basic", {
  // when using the global cache, it should fallback to resolving bare
  // specifiers with the global cache when it can't find it via the paths
  paths: ["/home"],
}));
