// Copyright 2018-2026 the Oden authors. MIT license.
// FAIL

function foo() {
  eval(`eval("eval('throw new Error()')")`);
}

foo();
