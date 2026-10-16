// Copyright 2018-2026 the Oden authors. MIT license.
// Utilities shared between `build.rs` and the rest of the crate.

use oden_core::Extension;
use oden_core::extension;

extension!(runtime,
  deps = [
    oden_webidl,
    oden_tls,
    oden_web,
    oden_fetch,
    oden_cache,
    oden_websocket,
    oden_webstorage,
    oden_crypto,
    oden_node,
    oden_ffi,
    oden_net,
    oden_napi,
    oden_http,
    oden_io,
    oden_fs,
    oden_bundle_runtime
  ],
  esm_entry_point = "ext:runtime/90_oden_ns.js",
  esm = [
    dir "js",
    "90_oden_ns.js",
    "97_navigator_user_agent_data.js",
    "98_global_scope_shared.js",
    "98_global_scope_window.js",
    "98_global_scope_worker.js"
  ],
  lazy_loaded_js = [
    dir "js",
    "01_errors.js",
    "01_version.ts",
    "06_util.js",
    "10_permissions.js",
    "11_workers.js",
    "40_fs_events.js",
    "40_tty.js",
    "41_prompt.js",
  ],
  customizer = |ext: &mut Extension| {
    #[cfg(not(feature = "exclude_runtime_main_js"))]
    {
      use oden_core::ExtensionFileSource;
      // `flags.js` is an ad-hoc inline source that lives only in the snapshot
      // (it's evaluated during snapshot creation and reachable through the
      // snapshot blob at runtime).
      ext.esm_files.to_mut().push(ExtensionFileSource::loaded_from_memory_during_snapshot(
        "ext:oden_features/flags.js",
        oden_features::JS_SOURCE,
      ));
      // 99_main.js is the snapshot's ESM entry point; its source is loaded
      // from disk only during snapshot creation, so we don't duplicate it in
      // the final binary's `.rodata`.
      ext.esm_files.to_mut().push(ExtensionFileSource::loaded_during_snapshot(
        "ext:runtime_main/js/99_main.js",
        concat!(env!("CARGO_MANIFEST_DIR"), "/js/99_main.js"),
      ));
      ext.esm_entry_point = Some("ext:runtime_main/js/99_main.js");
    }
  }
);
