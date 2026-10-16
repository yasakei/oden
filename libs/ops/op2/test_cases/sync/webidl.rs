// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

#[op2]
fn op_webidl(#[webidl] s: String, #[webidl] _n: u32) -> u32 {
  s.len() as _
}
