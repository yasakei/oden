export function foo() {
  // oden-coverage-ignore-start
  if (1 > 2) {
    // oden-coverage-ignore-start
    console.log("That's odd!");
    // oden-coverage-ignore-stop
  }
  // oden-coverage-ignore-stop
}
