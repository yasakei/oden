// NOTE: Ensure that source maps are handled correctly by adding a type which
//       will be removed during transpilation
type Dummy = {
  _: string;
};

export function used(condition: boolean): boolean {
  // oden-coverage-ignore-start
  if (condition) {
    return false;
  }
  // oden-coverage-ignore-stop

  return true;
}

// oden-coverage-ignore-start
function unused() {
  console.log("unused");
}
