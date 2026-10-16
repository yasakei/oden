// Simulates what a BDD library (e.g. @std/testing/bdd) does when it wraps
// user tests: it calls Oden.test() internally but sets
// Symbol.for("Oden.test.location") on the test function so the runner uses
// the user's source location instead of the library's own file.

// deno-lint-ignore no-explicit-any
const libraryRegisteredFn: any = () => {};
libraryRegisteredFn[Symbol.for("Oden.test.location")] =
  "https://jsr.io/@std/testing/1.0.0/bdd.ts:100:10";
Oden.test("library registered test", libraryRegisteredFn);

// Ordinary test without a location override — location is this file.
Oden.test("normal test", () => {});
