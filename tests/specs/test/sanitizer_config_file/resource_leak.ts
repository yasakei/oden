Oden.test("resource leak", () => {
  Oden.openSync("oden_no_sanitizers.json");
});
