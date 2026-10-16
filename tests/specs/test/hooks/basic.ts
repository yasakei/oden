const logs: string[] = [];

Oden.test.beforeAll(() => {
  logs.push("beforeAll 1");
});

Oden.test.beforeAll(() => {
  logs.push("beforeAll 2");
});

Oden.test.beforeAll(() => {
  logs.push("beforeAll 3");
});

// Multiple beforeEach hooks
Oden.test.beforeEach(() => {
  logs.push("beforeEach 1");
});

Oden.test.beforeEach(() => {
  logs.push("beforeEach 2");
});

// Multiple afterEach hooks
Oden.test.afterEach(() => {
  logs.push("afterEach 1");
});

Oden.test.afterEach(() => {
  logs.push("afterEach 2");
});

// Multiple afterAll hooks
Oden.test.afterAll(() => {
  logs.push("afterAll 1");
});

Oden.test.afterAll(() => {
  logs.push("afterAll 2");
});

Oden.test("first test", () => {
  logs.push("test 1");
});

Oden.test("second test", () => {
  logs.push("test 2");
});

Oden.test("third test", () => {
  logs.push("test 3");
});

globalThis.onunload = () => {
  console.log(logs);
};
