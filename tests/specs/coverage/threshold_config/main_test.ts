import { add } from "./main.ts";

Oden.test(function addWorks() {
  if (add(1, 2) !== 3) {
    throw new Error("bad");
  }
});
