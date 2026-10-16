Oden.test("Oden.exitCode", () => {
  Oden.exitCode = 5;
  throw new Error("");
});

Oden.test("success", () => {
});
