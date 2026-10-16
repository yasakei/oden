// CLI passes --sanitize-ops but module-level disables it
Oden.test.sanitizer({ ops: false });

Oden.test("timer leak allowed because module disables sanitizer", () => {
  setTimeout(() => {}, 10000);
});
