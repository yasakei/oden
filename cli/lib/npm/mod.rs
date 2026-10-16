// Copyright 2018-2026 the Oden authors. MIT license.

mod permission_checker;

use std::sync::Arc;

use oden_npm_installer::process_state::NpmProcessState;
use oden_npm_installer::process_state::NpmProcessStateKind;
use oden_npm_installer::process_state::NpmProcessStateLinkerMode;
use oden_resolver::npm::ByonmNpmResolver;
use oden_resolver::npm::ManagedNpmResolverRc;
use oden_resolver::npm::NpmResolver;
use oden_runtime::oden_process::NpmProcessStateProvider;
use oden_runtime::oden_process::NpmProcessStateProviderRc;
pub use permission_checker::NpmRegistryReadPermissionChecker;
pub use permission_checker::NpmRegistryReadPermissionCheckerMode;

use crate::sys::OdenLibSys;

pub fn create_npm_process_state_provider<TSys: OdenLibSys>(
  npm_resolver: &NpmResolver<TSys>,
) -> NpmProcessStateProviderRc {
  match npm_resolver {
    NpmResolver::Byonm(byonm_npm_resolver) => {
      Arc::new(ByonmNpmProcessStateProvider(byonm_npm_resolver.clone()))
    }
    NpmResolver::Managed(managed_npm_resolver) => {
      Arc::new(ManagedNpmProcessStateProvider(managed_npm_resolver.clone()))
    }
  }
}

#[derive(Debug)]
pub struct ManagedNpmProcessStateProvider<TSys: OdenLibSys>(
  pub ManagedNpmResolverRc<TSys>,
);

impl<TSys: OdenLibSys> NpmProcessStateProvider
  for ManagedNpmProcessStateProvider<TSys>
{
  fn get_npm_process_state(&self) -> String {
    let linker_mode = match self.0.linker_mode().as_str() {
      "hoisted" => NpmProcessStateLinkerMode::Hoisted,
      _ => NpmProcessStateLinkerMode::Isolated,
    };
    NpmProcessState::new_managed(
      self.0.resolution().serialized_valid_snapshot(),
      self.0.root_node_modules_path(),
      linker_mode,
    )
    .as_serialized()
  }
}

#[derive(Debug)]
pub struct ByonmNpmProcessStateProvider<TSys: OdenLibSys>(
  pub Arc<ByonmNpmResolver<TSys>>,
);

impl<TSys: OdenLibSys> NpmProcessStateProvider
  for ByonmNpmProcessStateProvider<TSys>
{
  fn get_npm_process_state(&self) -> String {
    NpmProcessState {
      kind: NpmProcessStateKind::Byonm,
      local_node_modules_path: self
        .0
        .root_node_modules_path()
        .map(|p| p.to_string_lossy().into_owned()),
      linker_mode: NpmProcessStateLinkerMode::default(),
    }
    .as_serialized()
  }
}
