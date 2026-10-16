Oden.test.sanitizer({ ops: true });

Oden.test("timer leak caught by module sanitizer", () => {
  setTimeout(() => {}, 10000);
});
