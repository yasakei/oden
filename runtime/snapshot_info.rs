// Copyright 2018-2026 the Oden authors. MIT license.

use std::sync::Arc;

use oden_core::Extension;
use oden_resolver::npm::OdenInNpmPackageChecker;
use oden_resolver::npm::NpmResolver;

use crate::ops;
use crate::shared::runtime;

pub fn get_extensions_in_snapshot() -> Vec<Extension> {
  // NOTE(bartlomieju): ordering is important here, keep it in sync with
  // `runtime/worker.rs`, `runtime/web_worker.rs`, `runtime/snapshot_info.rs`
  // and `runtime/snapshot.rs`!
  let fs = std::sync::Arc::new(oden_fs::RealFs);
  vec![
    oden_telemetry::oden_telemetry::init(),
    oden_webidl::oden_webidl::init(),
    oden_web::oden_web::init(
      oden_web::BlobStore::default_arc(),
      Default::default(),
      Default::default(),
      oden_web::InMemoryBroadcastChannel::default(),
    ),
    oden_webgpu::oden_webgpu::init(),
    oden_image::oden_image::init(),
    oden_canvas::oden_canvas::init(),
    oden_fetch::oden_fetch::init(Default::default()),
    oden_cache::oden_cache::init(None),
    oden_websocket::oden_websocket::init(),
    oden_webstorage::oden_webstorage::init(None),
    oden_crypto::oden_crypto::init(None),
    oden_ffi::oden_ffi::init(None),
    oden_net::oden_net::init(None, None),
    oden_tls::oden_tls::init(),
    oden_kv::oden_kv::init(
      Box::new(oden_kv::sqlite::SqliteDbHandler::new(None, None)),
      oden_kv::KvConfig::builder().build(),
    ),
    oden_cron::oden_cron::init(Box::new(
      oden_cron::local::LocalCronHandler::new(),
    )),
    oden_napi::oden_napi::init(None),
    oden_http::oden_http::init(oden_http::Options::default()),
    oden_io::oden_io::init(Some(Default::default())),
    oden_fs::oden_fs::init(fs.clone()),
    oden_os::oden_os::init(Default::default()),
    oden_process::oden_process::init(Default::default()),
    oden_node_crypto::oden_node_crypto::init(),
    oden_node_sqlite::oden_node_sqlite::init(),
    oden_node::oden_node::init::<
      OdenInNpmPackageChecker,
      NpmResolver<sys_traits::impls::RealSys>,
      sys_traits::impls::RealSys,
    >(None, fs.clone()),
    ops::runtime::oden_runtime::init("oden:runtime".parse().unwrap()),
    ops::worker_host::oden_worker_host::init(
      Arc::new(|_| unreachable!("not used in snapshot.")),
      None,
    ),
    ops::fs_events::oden_fs_events::init(),
    ops::permissions::oden_permissions::init(),
    ops::tty::oden_tty::init(),
    ops::http::oden_http_runtime::init(),
    oden_bundle_runtime::oden_bundle_runtime::init(None),
    ops::desktop::oden_desktop::init(),
    ops::bootstrap::oden_bootstrap::init(None, false),
    runtime::init(),
    ops::web_worker::oden_web_worker::init(),
  ]
}
