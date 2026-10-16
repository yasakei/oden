// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

use std::cell::RefCell;
use std::rc::Rc;

use oden_core::OpState;

#[op2(fast)]
fn op_state_rc(_state: Rc<RefCell<OpState>>) {}
