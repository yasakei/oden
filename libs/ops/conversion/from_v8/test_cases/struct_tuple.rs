// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

#[derive(FromV8)]
pub struct Tuple(#[from_v8(serde)] u8, u8);
