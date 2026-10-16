// Copyright 2018-2026 the Oden authors. MIT license.

use std::sync::atomic::AtomicUsize;
use std::sync::atomic::Ordering;

mod async_flag;

pub use async_flag::AsyncFlag;
pub use oden_core::unsync::sync::AtomicFlag;

#[derive(Debug, Default)]
pub struct RelaxedAtomicCounter {
  value: AtomicUsize,
}

impl RelaxedAtomicCounter {
  pub fn inc(&self) {
    self.value.fetch_add(1, Ordering::Relaxed);
  }

  pub fn get(&self) -> usize {
    self.value.load(Ordering::Relaxed)
  }
}
