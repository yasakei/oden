// Copyright 2018-2026 the Oden authors. MIT license.

fn main() {
  // Skip building from docs.rs.
  if std::env::var_os("DOCS_RS").is_some() {
    return;
  }

  oden_runtime::oden_napi::print_linker_flags("odenrt");
  oden_runtime::oden_webgpu::print_linker_flags("odenrt");
}
