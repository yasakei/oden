Oden.test("internal test harness modules are not remapped", () => {
  if (typeof Oden.test !== "function") {
    throw new Error("unreachable");
  }
});
