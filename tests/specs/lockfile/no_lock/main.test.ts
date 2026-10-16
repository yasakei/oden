import { getValue } from "mod";

Oden.test("test", () => {
  const testing = 1 + getValue();
  if (testing !== 6) {
    throw "FAIL";
  }
});
