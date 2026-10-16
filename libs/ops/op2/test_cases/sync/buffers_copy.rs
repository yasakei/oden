// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

#[op2(fast)]
fn op_buffers(
  #[buffer(copy)] _a: Vec<u8>,
  #[buffer(copy)] _b: Box<[u8]>,
  #[buffer(copy)] _c: bytes::Bytes,
) {
}

#[op2(fast)]
fn op_buffers_32(#[buffer(copy)] _a: Vec<u32>, #[buffer(copy)] _b: Box<[u32]>) {
}
