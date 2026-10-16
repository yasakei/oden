Oden.test.sanitizer({ resources: true });

Oden.test("resource leak caught by module sanitizer", () => {
  Oden.openSync("module_resources.ts");
});
