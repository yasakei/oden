// Copyright 2018-2026 the Oden authors. MIT license.
// FAIL

function assert(cond) {
  if (!cond) {
    throw Error("assert");
  }
}
function main() {
  assert(false);
}
main();
