// Copyright 2018-2026 the Oden authors. MIT license.

fn main() {
  println!("cargo:rustc-link-arg-benches=-rdynamic");
  println!("cargo:rerun-if-changed=build.rs");
}
