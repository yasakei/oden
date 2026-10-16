const logs: string[] = [];

Oden.test.beforeAll(() => {
  logs.push("beforeAll 1 executed");
  throw new Error("beforeAll 1 failed");
});

Oden.test.beforeAll(() => {
  logs.push("beforeAll 2 executed");
});

Oden.test("first test", () => {
  logs.push("test executed");
});

Oden.test.afterAll(() => {
  logs.push("afterAll 2 executed");
});

Oden.test.afterAll(() => {
  logs.push("afterAll 1 executed");
});

globalThis.onunload = () => {
  console.log(logs);
};
