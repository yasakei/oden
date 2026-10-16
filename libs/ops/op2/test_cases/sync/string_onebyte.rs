// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

use std::borrow::Cow;

#[op2(fast)]
fn op_string_onebyte(#[string(onebyte)] s: Cow<[u8]>) -> u32 {
  s.len() as _
}
