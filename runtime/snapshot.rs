// Copyright 2018-2026 the Oden authors. MIT license.

use std::io::Write;
use std::path::PathBuf;
use std::rc::Rc;

use oden_core::Extension;
use oden_core::ExtensionFileSource;
use oden_core::ExtensionFileSourceCode;
use oden_core::snapshot::*;
use oden_core::v8;
use oden_resolver::npm::OdenInNpmPackageChecker;
use oden_resolver::npm::NpmResolver;

use crate::ops;
use crate::ops::bootstrap::SnapshotOptions;
use crate::shared::runtime;

/// A single lazy_loaded_* entry declared by an extension, in
/// `(specifier, absolute source path)` form. The build script uses this to
/// decide which sources still need to be embedded in the final binary.
#[derive(Clone, Debug)]
pub struct LazyExtensionFile {
  pub specifier: String,
  pub path: PathBuf,
  pub kind: LazyExtensionFileKind,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum LazyExtensionFileKind {
  /// `lazy_loaded_js` — loaded on demand via `core.loadExtScript()`.
  Js,
  /// `lazy_loaded_esm` — loaded on demand via `op_lazy_load_esm` (i.e. the
  /// `createLazyLoader` factory exposed by `Oden.core`).
  Esm,
}

pub struct CreateRuntimeSnapshotOutput {
  /// Paths the snapshot read from disk; emit as `cargo:rerun-if-changed`.
  pub files_loaded_during_snapshot: Vec<PathBuf>,
  /// Specifiers of `lazy_loaded_*` files compiled into the snapshot blob.
  /// Their source already lives in the snapshot; no `include_str!` is needed.
  pub consumed_lazy_specifiers: Vec<String>,
  /// Every `lazy_loaded_*` file declared by any extension fed to the snapshot.
  /// The residual set the binary needs at runtime is
  /// `lazy_extension_files \ consumed_lazy_specifiers`.
  pub lazy_extension_files: Vec<LazyExtensionFile>,
}

pub fn create_runtime_snapshot(
  snapshot_path: PathBuf,
  snapshot_options: SnapshotOptions,
  // NOTE: For embedders that wish to add additional extensions to the snapshot
  custom_extensions: Vec<Extension>,
) -> CreateRuntimeSnapshotOutput {
  // NOTE(bartlomieju): ordering is important here, keep it in sync with
  // `runtime/worker.rs`, `runtime/web_worker.rs`, `runtime/snapshot_info.rs`
  // and `runtime/snapshot.rs`!
  let mut extensions: Vec<Extension> = vec![
    oden_telemetry::oden_telemetry::lazy_init(),
    oden_webidl::oden_webidl::lazy_init(),
    oden_web::oden_web::lazy_init(),
    oden_webgpu::oden_webgpu::lazy_init(),
    oden_image::oden_image::lazy_init(),
    oden_canvas::oden_canvas::lazy_init(),
    oden_fetch::oden_fetch::lazy_init(),
    oden_cache::oden_cache::lazy_init(),
    oden_websocket::oden_websocket::lazy_init(),
    oden_webstorage::oden_webstorage::lazy_init(),
    oden_crypto::oden_crypto::lazy_init(),
    oden_ffi::oden_ffi::lazy_init(),
    oden_net::oden_net::lazy_init(),
    oden_tls::oden_tls::lazy_init(),
    oden_kv::oden_kv::lazy_init(),
    oden_cron::oden_cron::init(Box::new(
      oden_cron::local::LocalCronHandler::new(),
    )),
    oden_napi::oden_napi::lazy_init(),
    oden_http::oden_http::lazy_init(),
    oden_io::oden_io::lazy_init(),
    oden_fs::oden_fs::lazy_init(),
    oden_os::oden_os::lazy_init(),
    oden_process::oden_process::lazy_init(),
    oden_node_crypto::oden_node_crypto::lazy_init(),
    oden_node_sqlite::oden_node_sqlite::lazy_init(),
    oden_node::oden_node::lazy_init::<
      OdenInNpmPackageChecker,
      NpmResolver<sys_traits::impls::RealSys>,
      sys_traits::impls::RealSys,
    >(),
    ops::runtime::oden_runtime::lazy_init(),
    ops::worker_host::oden_worker_host::lazy_init(),
    ops::fs_events::oden_fs_events::lazy_init(),
    ops::permissions::oden_permissions::lazy_init(),
    ops::tty::oden_tty::lazy_init(),
    ops::http::oden_http_runtime::lazy_init(),
    oden_bundle_runtime::oden_bundle_runtime::lazy_init(),
    ops::desktop::oden_desktop::lazy_init(),
    ops::bootstrap::oden_bootstrap::init(Some(snapshot_options), false),
    runtime::lazy_init(),
    ops::web_worker::oden_web_worker::lazy_init(),
  ];
  extensions.extend(custom_extensions);

  let lazy_extension_files = collect_lazy_extension_files(&extensions);
  let minify_sources =
    std::env::var_os("ODEN_SNAPSHOT_MINIFY_SOURCES").is_some();

  let output = create_snapshot(
    CreateSnapshotOptions {
      cargo_manifest_dir: env!("CARGO_MANIFEST_DIR"),
      startup_snapshot: None,
      extensions,
      extension_transpiler: Some(Rc::new(move |specifier, source| {
        if minify_sources {
          crate::transpile::maybe_transpile_and_minify_source(specifier, source)
        } else {
          crate::transpile::maybe_transpile_source(specifier, source)
        }
      })),
      with_runtime_cb: Some(Box::new(|rt| {
        let isolate = rt.v8_isolate();
        v8::scope!(scope, isolate);

        let tmpl = oden_node::init_global_template(
          scope,
          oden_node::ContextInitMode::ForSnapshot,
        );
        let ctx = oden_node::create_v8_context(
          scope,
          tmpl,
          oden_node::ContextInitMode::ForSnapshot,
          std::ptr::null_mut(),
        );
        assert_eq!(scope.add_context(ctx), oden_node::VM_CONTEXT_INDEX);
      })),
      skip_op_registration: false,
    },
    None,
  )
  .unwrap();
  let mut snapshot = std::fs::File::create(snapshot_path).unwrap();
  snapshot.write_all(&output.output).unwrap();

  #[allow(clippy::print_stdout, reason = "necessary for build code")]
  for path in &output.files_loaded_during_snapshot {
    println!("cargo:rerun-if-changed={}", path.display());
  }

  CreateRuntimeSnapshotOutput {
    files_loaded_during_snapshot: output.files_loaded_during_snapshot,
    consumed_lazy_specifiers: output.consumed_lazy_specifiers,
    lazy_extension_files,
  }
}

fn collect_lazy_extension_files(
  extensions: &[Extension],
) -> Vec<LazyExtensionFile> {
  let mut out = Vec::new();
  for ext in extensions {
    for file in &*ext.lazy_loaded_js_files {
      if let Some(entry) = lazy_file_entry(file, LazyExtensionFileKind::Js) {
        out.push(entry);
      }
    }
    for file in &*ext.lazy_loaded_esm_files {
      if let Some(entry) = lazy_file_entry(file, LazyExtensionFileKind::Esm) {
        out.push(entry);
      }
    }
  }
  out.sort_by(|a, b| a.specifier.cmp(&b.specifier));
  out.dedup_by(|a, b| a.specifier == b.specifier);
  out
}

fn lazy_file_entry(
  file: &ExtensionFileSource,
  kind: LazyExtensionFileKind,
) -> Option<LazyExtensionFile> {
  #[allow(deprecated, reason = "matching deprecated variant we still inspect")]
  let path = match &file.code {
    ExtensionFileSourceCode::LoadedFromFsDuringSnapshot(p) => PathBuf::from(p),
    // After the macro change every lazy entry is LoadedFromFsDuringSnapshot;
    // the other variants only appear for ad-hoc entries pushed by customizers
    // (e.g. inline sources) that have no on-disk path and therefore can't be
    // re-embedded by the build script.
    ExtensionFileSourceCode::IncludedInBinary(_)
    | ExtensionFileSourceCode::LoadedFromMemoryDuringSnapshot(_)
    | ExtensionFileSourceCode::Computed(_) => return None,
  };
  Some(LazyExtensionFile {
    specifier: file.specifier.to_string(),
    path,
    kind,
  })
}
