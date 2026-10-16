const timer = setTimeout(() => {}, 1000000);

Oden.test("test 1", () => {
  clearTimeout(timer);
});
