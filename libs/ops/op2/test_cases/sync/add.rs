// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

#[op2(fast)]
fn op_add(a: u32, b: u32) -> u32 {
  a + b
}
