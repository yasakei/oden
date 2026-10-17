// Copyright 2018-2026 the Oden authors. MIT license.

use std::sync::Arc;
use std::time::Instant;

use deno_path_util::url_to_file_path;
use deno_terminal::colors;
use oden_core::anyhow::Context;
use oden_core::anyhow::bail;
use oden_core::error::AnyError;

use super::ConfigKind;
use super::ConfigUpdater;
use super::cache_top_level_deps;
use super::CacheTopLevelDepsOptions;
use crate::args::Flags;
use crate::args::VendorFlags;
use crate::factory::CliFactory;

pub async fn vendor_command(
  flags: Arc<Flags>,
  vendor_flags: VendorFlags,
) -> Result<(), AnyError> {
  node_resolver::PackageJsonThreadLocalCache::clear();

  let cli_factory = CliFactory::from_flags(flags.clone());
  // `vendor_parse` forces `--vendor=true`, so discovery always materializes
  // a vendor dir path.
  let (vendor_dir, oden_json_path) = {
    let options = cli_factory.cli_options()?;
    let Some(vendor_dir) = options.vendor_dir_path().cloned() else {
      bail!("Failed to determine the vendor directory for vendoring")
    };
    let oden_json_path = match options.start_dir.member_or_root_oden_json() {
      Some(config) => url_to_file_path(&config.specifier)?,
      None => {
        let path = options.initial_cwd().join("oden.json");
        std::fs::write(&path, "{}\n").with_context(|| {
          format!("Failed to create oden.json file at {}", path.display())
        })?;
        log::info!("Created oden.json configuration file.");
        path
      }
    };
    (vendor_dir, oden_json_path)
  };

  // Persist "vendor": true so future normal (non-flagged) runs also use the
  // vendor dir.
  let mut vendor_config =
    ConfigUpdater::new(ConfigKind::OdenJson, oden_json_path)?;
  vendor_config.set_vendor();
  vendor_config.commit()?;

  // Promise the vendor dir exists even for npm-only projects, where the
  // vendored HTTP cache would otherwise never be touched.
  vendor_dir.create_dir_all();

  let start = Instant::now();
  if vendor_flags.entrypoints.is_empty() {
    let npm_installer = cli_factory.npm_installer().await?;
    npm_installer.ensure_no_pkg_json_dep_errors()?;
    cache_top_level_deps(
      &cli_factory,
      None,
      CacheTopLevelDepsOptions {
        lockfile_only: false,
        additional_roots: vec![],
      },
    )
    .await?;

    if let Some(lockfile) = cli_factory.maybe_lockfile().await? {
      lockfile.write_if_changed()?;
    }

    if let Some(install_reporter) = cli_factory.install_reporter()? {
      let workspace = cli_factory.workspace_resolver().await?;
      let npm_resolver = cli_factory.npm_resolver().await?;
      crate::tools::installer::print_install_report(
        &cli_factory.sys(),
        start.elapsed(),
        install_reporter,
        workspace,
        npm_resolver,
      );
    }
  } else {
    crate::tools::installer::install_from_entrypoints(
      flags,
      crate::args::InstallEntrypointsFlags {
        entrypoints: vendor_flags.entrypoints,
        lockfile_only: false,
        production: false,
        skip_types: false,
      },
    )
    .await?;
  }

  log::info!(
    "{} {}",
    colors::gray("Vendored dependencies to"),
    colors::gray(vendor_dir.display().to_string()),
  );

  Ok(())
}
