// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

#[derive(WebIDL)]
#[webidl(enum)]
pub enum Enumeration {
  FooBar,
  Baz,
  #[webidl(rename = "hello")]
  World,
}
