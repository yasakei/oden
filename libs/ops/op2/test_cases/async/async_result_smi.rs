// Copyright 2018-2026 the Oden authors. MIT license.

#![deny(warnings)]
oden_ops_compile_test_runner::prelude!();

pub type ResourceId = i16;

#[op2]
#[smi]
pub async fn op_async(#[smi] rid: ResourceId) -> std::io::Result<ResourceId> {
  Ok(rid as _)
}
