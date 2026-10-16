const logs: string[] = [];

Oden.test.beforeEach(() => {
  logs.push("beforeEach");
});

Oden.test.afterEach(() => {
  logs.push("afterEach");
});

Oden.test("first test", () => {
  logs.push("test executed");
  throw new Error("test threw");
});

globalThis.onunload = () => console.log(logs);
