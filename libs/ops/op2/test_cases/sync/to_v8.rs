// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();
use oden_core::ToV8;
use oden_core::v8;

struct Foo;

impl<'a> ToV8<'a> for Foo {
  type Error = std::convert::Infallible;
  fn to_v8(
    self,
    scope: &mut v8::PinScope<'a, '_>,
  ) -> Result<v8::Local<'a, v8::Value>, Self::Error> {
    Ok(v8::null(scope).into())
  }
}

#[op2]
pub fn op_to_v8_return() -> Foo {
  Foo
}
