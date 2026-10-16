// Test file to verify error handling in afterAll hooks

Oden.test.afterAll(() => {
  console.log("afterAll 2 executed");
});

Oden.test.afterAll(() => {
  console.log("afterAll 1 executed");
  throw new Error("afterAll 1 failed");
});

Oden.test("first test", () => {
  console.log("test executed");
});
