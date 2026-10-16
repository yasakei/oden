// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

#[derive(ToV8)]
pub struct Tuple(#[to_v8(serde)] u8, u8);
