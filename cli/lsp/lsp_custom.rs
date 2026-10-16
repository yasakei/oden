// Copyright 2018-2026 the Oden authors. MIT license.

use oden_core::serde::Deserialize;
use oden_core::serde::Serialize;
use tower_lsp::lsp_types as lsp;

pub const PERFORMANCE_REQUEST: &str = "oden/performance";
pub const INFERRED_TYPE_REQUEST: &str = "oden/inferredType";
pub const INFERRED_TYPE_COMMAND: &str = "oden.inferredType";
pub const TASK_REQUEST: &str = "oden/taskDefinitions";
pub const VIRTUAL_TEXT_DOCUMENT: &str = "oden/virtualTextDocument";

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InferredTypeParams {
  pub text_document: lsp::TextDocumentIdentifier,
  pub position: lsp::Position,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InferredTypeResponse {
  pub text: String,
  pub range: lsp::Range,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskDefinition {
  pub name: String,
  pub command: Option<String>,
  pub description: Option<String>,
  pub source_uri: lsp::Uri,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RegistryStateNotificationParams {
  pub origin: String,
  pub suggestions: bool,
}

pub enum RegistryStateNotification {}

impl lsp::notification::Notification for RegistryStateNotification {
  type Params = RegistryStateNotificationParams;

  const METHOD: &'static str = "oden/registryState";
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VirtualTextDocumentParams {
  pub text_document: lsp::TextDocumentIdentifier,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OdenConfigurationData {
  pub scope_uri: lsp::Uri,
  pub workspace_root_scope_uri: Option<lsp::Uri>,
  pub oden_json: Option<lsp::TextDocumentIdentifier>,
  pub package_json: Option<lsp::TextDocumentIdentifier>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DidRefreshOdenConfigurationTreeNotificationParams {
  pub data: Vec<OdenConfigurationData>,
  pub oden_dir_npm_folder_uri: Option<lsp::Uri>,
}

pub enum DidRefreshOdenConfigurationTreeNotification {}

impl lsp::notification::Notification
  for DidRefreshOdenConfigurationTreeNotification
{
  type Params = DidRefreshOdenConfigurationTreeNotificationParams;
  const METHOD: &'static str = "oden/didRefreshOdenConfigurationTree";
}

#[derive(Debug, Eq, Hash, PartialEq, Copy, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum OdenConfigurationChangeType {
  Added,
  Changed,
  Removed,
}

impl OdenConfigurationChangeType {
  pub fn from_file_change_type(file_event: lsp::FileChangeType) -> Self {
    match file_event {
      lsp::FileChangeType::CREATED => Self::Added,
      lsp::FileChangeType::CHANGED => Self::Changed,
      lsp::FileChangeType::DELETED => Self::Removed,
      _ => Self::Changed, // non-exhaustable enum
    }
  }
}

#[derive(Debug, Eq, Hash, PartialEq, Copy, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum OdenConfigurationType {
  OdenJson,
  PackageJson,
}

#[derive(Debug, Eq, Hash, PartialEq, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OdenConfigurationChangeEvent {
  pub scope_uri: lsp::Uri,
  pub file_uri: lsp::Uri,
  #[serde(rename = "type")]
  pub typ: OdenConfigurationChangeType,
  pub configuration_type: OdenConfigurationType,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DidChangeOdenConfigurationNotificationParams {
  pub changes: Vec<OdenConfigurationChangeEvent>,
}

// TODO(nayeemrmn): This is being replaced by
// `DidRefreshOdenConfigurationTreeNotification` for Oden > v2.0.0. Remove it
// soon.
pub enum DidChangeOdenConfigurationNotification {}

impl lsp::notification::Notification
  for DidChangeOdenConfigurationNotification
{
  type Params = DidChangeOdenConfigurationNotificationParams;
  const METHOD: &'static str = "oden/didChangeOdenConfiguration";
}

pub enum DidUpgradeCheckNotification {}

impl lsp::notification::Notification for DidUpgradeCheckNotification {
  type Params = DidUpgradeCheckNotificationParams;
  const METHOD: &'static str = "oden/didUpgradeCheck";
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpgradeAvailable {
  pub latest_version: String,
  pub is_canary: bool,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DidUpgradeCheckNotificationParams {
  pub upgrade_available: Option<UpgradeAvailable>,
}

/// This notification is only sent for testing purposes
/// in order to group diagnostics.
pub enum DiagnosticBatchStartNotification {}

impl lsp::notification::Notification for DiagnosticBatchStartNotification {
  type Params = ();
  const METHOD: &'static str = "oden/internalTestDiagnosticBatchStart";
}

/// This notification is only sent for testing purposes
/// in order to group diagnostics.
pub enum DiagnosticBatchEndNotification {}

impl lsp::notification::Notification for DiagnosticBatchEndNotification {
  type Params = ();
  const METHOD: &'static str = "oden/internalTestDiagnosticBatchEnd";
}
