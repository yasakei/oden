// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

use oden_core::JsBuffer;

#[op2]
#[buffer]
pub async fn op_async_v8_buffer(#[buffer] buf: JsBuffer) -> JsBuffer {
  buf
}
