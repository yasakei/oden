// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

#[op2]
#[string]
pub fn op_string_return(#[string] s: Option<String>) -> Option<String> {
  s
}
