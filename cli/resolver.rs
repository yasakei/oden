// Copyright 2018-2026 the Oden authors. MIT license.

use oden_resolver::npm::OdenInNpmPackageChecker;
use node_resolver::OdenIsBuiltInNodeModuleChecker;

use crate::npm::CliNpmResolver;
use crate::sys::CliSys;

pub type CliCjsTracker =
  oden_resolver::cjs::CjsTracker<OdenInNpmPackageChecker, CliSys>;
pub type CliIsCjsResolver =
  oden_resolver::cjs::IsCjsResolver<OdenInNpmPackageChecker, CliSys>;
pub type CliNpmReqResolver<TSys = CliSys> = oden_resolver::npm::NpmReqResolver<
  OdenInNpmPackageChecker,
  OdenIsBuiltInNodeModuleChecker,
  CliNpmResolver<TSys>,
  TSys,
>;
pub type CliResolver = oden_resolver::graph::OdenResolver<
  OdenInNpmPackageChecker,
  OdenIsBuiltInNodeModuleChecker,
  CliNpmResolver,
  CliSys,
>;

pub fn on_resolve_diagnostic(
  diagnostic: oden_resolver::graph::MappedResolutionDiagnosticWithPosition,
) {
  log::warn!(
    "{} {}\n    at {}:{}",
    oden_runtime::colors::yellow("Warning"),
    diagnostic.diagnostic,
    diagnostic.referrer,
    diagnostic.start
  );
}
