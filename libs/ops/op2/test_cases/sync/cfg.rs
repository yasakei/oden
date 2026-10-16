// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

/// This is a doc comment.
#[op2(fast)]
#[cfg(windows)]
pub fn op_maybe_windows() -> () {}

/// This is a doc comment.
#[op2(fast)]
#[cfg(not(windows))]
pub fn op_maybe_windows() -> () {}
