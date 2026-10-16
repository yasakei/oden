// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

#[op2(async(lazy), fast)]
pub async fn op_async_lazy() -> std::io::Result<i32> {
  Ok(0)
}
