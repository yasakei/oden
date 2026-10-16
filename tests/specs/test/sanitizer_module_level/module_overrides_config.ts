// No config file enables sanitizers, but module-level does
Oden.test.sanitizer({ ops: true });

Oden.test("timer leak caught by module sanitizer overriding config", () => {
  setTimeout(() => {}, 10000);
});
