Oden.test(function foo() {
});

Oden.test.beforeAll(() => {});
Oden.test.beforeEach(() => {});
Oden.test.afterEach(() => {});
Oden.test.afterAll(() => {});
Oden.test.ignore("ignored", () => {});
Oden.test.only("only", () => {});
Oden.test.sanitizer({ ops: false });
Oden.test.each([1, 2])("each %d", () => {});

Oden.bench(function bar() {
});
