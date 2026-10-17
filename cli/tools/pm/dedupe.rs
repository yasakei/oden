// Copyright 2018-2026 the Oden authors. MIT license.

use std::sync::Arc;
use std::time::Instant;

use deno_terminal::colors;
use oden_core::error::AnyError;

use super::cache_deps::CacheTopLevelDepsOptions;
use super::cache_deps::cache_top_level_deps;
use crate::args::DedupeFlags;
use crate::args::Flags;
use crate::factory::CliFactory;

fn npm_version_count(lockfile: &oden_lockfile::Lockfile) -> usize {
  lockfile.content.packages.npm.len()
}

pub async fn dedupe_command(
  flags: Arc<Flags>,
  _dedupe_flags: DedupeFlags,
) -> Result<(), AnyError> {
  node_resolver::PackageJsonThreadLocalCache::clear();

  let cli_factory = CliFactory::from_flags(flags);
  let npm_installer = cli_factory.npm_installer().await?;
  npm_installer.ensure_no_pkg_json_dep_errors()?;
  let maybe_lockfile = cli_factory.maybe_lockfile().await?;
  let npm_version_count_before = maybe_lockfile
    .as_ref()
    .map(|lockfile| npm_version_count(&lockfile.lock()));
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

  let start = Instant::now();
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

  let Some(lockfile) = maybe_lockfile else {
    return Ok(());
  };
  lockfile.write_if_changed()?;

  // The warm-cache path emits no install report, so always summarize the
  // collapse to keep the command's output deterministic.
  let Some(before) = npm_version_count_before else {
    return Ok(());
  };
  let after = npm_version_count(&lockfile.lock());
  if after < before {
    let removed = before - after;
    log::info!(
      "{} {} {}",
      colors::gray("Removed"),
      removed,
      colors::gray(if removed == 1 {
        "duplicate package version"
      } else {
        "duplicate package versions"
      }),
    );
  } else {
    log::info!("{}", colors::gray("No duplicate package versions found"));
  }

  Ok(())
}
