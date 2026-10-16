Oden.test("timer leak", () => {
  setTimeout(() => {}, 10000);
});
