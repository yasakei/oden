// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

use oden_core::v8;
use deno_error::JsErrorBox;

#[op2(fast)]
pub fn op_void_with_result(
  _scope: &mut v8::PinScope,
) -> Result<(), JsErrorBox> {
  Ok(())
}
