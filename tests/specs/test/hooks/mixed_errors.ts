let testCount = 0;
const logs: string[] = [];

Oden.test.beforeEach(() => {
  testCount++;
  logs.push(`beforeEach executed for test ${testCount}`);

  if (testCount === 3) {
    throw new Error("beforeEach failed for test 3");
  }
});

Oden.test.afterEach(() => {
  logs.push(`afterEach executed for test ${testCount}`);

  if (testCount === 4) {
    throw new Error("afterEach failed for test 4");
  }
});

Oden.test("test 1 - should pass", () => {
  logs.push("test 1 executed");
});

Oden.test("test 2 - should pass", () => {
  logs.push("test 2 executed");
});

Oden.test("test 3 - beforeEach fails", () => {
  logs.push("test 3 executed");
});

Oden.test("test 4 - afterEach fails", () => {
  logs.push("test 4 executed");
});

Oden.test("test 5 - test itself fails", () => {
  logs.push("test 5 executed");
  throw new Error("test 5 failed");
});

globalThis.onunload = () => {
  console.log(logs);
};
