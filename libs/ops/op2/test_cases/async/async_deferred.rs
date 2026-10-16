// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

#[op2(async(deferred), fast)]
pub async fn op_async_deferred() -> std::io::Result<i32> {
  Ok(0)
}
