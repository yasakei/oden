// Copyright 2018-2026 the Oden authors. MIT license.

use oden_core::ModuleSpecifier;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum CodeCacheType {
  EsModule,
  Script,
}

pub trait CodeCache: Send + Sync {
  fn get_sync(
    &self,
    specifier: &ModuleSpecifier,
    code_cache_type: CodeCacheType,
    source_hash: u64,
  ) -> Option<Vec<u8>>;

  fn set_sync(
    &self,
    specifier: ModuleSpecifier,
    code_cache_type: CodeCacheType,
    source_hash: u64,
    data: &[u8],
  );
}
