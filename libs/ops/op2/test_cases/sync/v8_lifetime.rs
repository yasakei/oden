// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

use oden_core::v8;

#[op2]
pub fn op_v8_lifetime<'s>(
  _s: v8::Local<'s, v8::String>,
) -> v8::Local<'s, v8::String> {
  unimplemented!()
}
