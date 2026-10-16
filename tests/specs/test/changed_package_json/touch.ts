// Bump only package.json. Even though no test module's import graph changed,
// a package.json change can alter npm dependencies, so every test runs.
Oden.writeTextFileSync(
  "package.json",
  Oden.readTextFileSync("package.json").replace("1.0.0", "1.0.1"),
);
