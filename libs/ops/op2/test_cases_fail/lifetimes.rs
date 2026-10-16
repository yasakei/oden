// Copyright 2018-2026 the Oden authors. MIT license.
#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();
use oden_core::GarbageCollected;
use oden_core::v8;

struct Wrap;

unsafe impl GarbageCollected for Wrap {
  fn trace(&self, _visitor: &mut v8::cppgc::Visitor) {}

  fn get_name(&self) -> &'static std::ffi::CStr {
    c"Wrap"
  }
}

#[op2(fast)]
fn op_use_cppgc_object(#[cppgc] _wrap: &'static Wrap) {}

#[op2(fast)]
fn op_use_buffer(#[buffer] _buffer: &'static [u8]) {}
