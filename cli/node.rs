// Copyright 2018-2026 the Oden authors. MIT license.

use oden_resolver::cjs::analyzer::OdenCjsCodeAnalyzer;
use oden_resolver::npm::OdenInNpmPackageChecker;
use node_resolver::OdenIsBuiltInNodeModuleChecker;
use node_resolver::analyze::CjsModuleExportAnalyzer;

use crate::npm::CliNpmResolver;
use crate::sys::CliSys;

pub type CliCjsCodeAnalyzer = OdenCjsCodeAnalyzer<CliSys>;

pub type CliCjsModuleExportAnalyzer = CjsModuleExportAnalyzer<
  CliCjsCodeAnalyzer,
  OdenInNpmPackageChecker,
  OdenIsBuiltInNodeModuleChecker,
  CliNpmResolver,
  CliSys,
>;
pub type CliNodeResolver<TSys = CliSys> = oden_runtime::oden_node::NodeResolver<
  OdenInNpmPackageChecker,
  CliNpmResolver<TSys>,
  TSys,
>;
pub type CliPackageJsonResolver<TSys = CliSys> =
  node_resolver::PackageJsonResolver<TSys>;
