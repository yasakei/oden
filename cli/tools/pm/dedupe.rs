// Copyright 2018-2026 the Oden authors. MIT license.

use std::sync::Arc;
use std::time::Instant;

use oden_core::error::AnyError;

use super::cache_deps::CacheTopLevelDepsOptions;
use super::cache_deps::cache_top_level_deps;
use crate::args::DedupeFlags;
use crate::args::Flags;
use crate::factory::CliFactory;

pub async fn dedupe_command(
  flags: Arc<Flags>,
  _dedupe_flags: DedupeFlags,
) -> Result<(), AnyError> {
  node_resolver::PackageJsonThreadLocalCache::clear();

  let cli_factory = CliFactory::from_flags(flags);
  let start = Instant::now();
  let npm_installer = cli_factory.npm_installer().await?;
  npm_installer.ensure_no_pkg_json_dep_errors()?;
  // Forget pinned versions so the install below re-resolves every
  // requirement from scratch with full dedup passes.
  npm_installer.reset_resolution().await?;
  cache_top_level_deps(
    &cli_factory,
    None,
    CacheTopLevelDepsOptions {
      lockfile_only: false,
      additional_roots: vec![],
    },
  )
  .await?;

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

  if let Some(lockfile) = cli_factory.maybe_lockfile().await? {
    lockfile.write_if_changed()?;
  }

  Ok(())
}
