// Copyright 2018-2026 the Oden authors. MIT license.

use std::convert::Infallible;

use deno_error::JsErrorBox;
use deno_error::JsErrorClass;
use oden_resolver::OdenResolveError;
use oden_resolver::OdenResolveErrorKind;
use oden_runtime::oden_core::error::AnyError;
use oden_runtime::oden_core::error::CoreError;
use oden_runtime::oden_core::error::CoreErrorKind;

pub trait InfallibleResultExt<T> {
  fn unwrap_infallible(self) -> T;
}

impl<T> InfallibleResultExt<T> for Result<T, Infallible> {
  fn unwrap_infallible(self) -> T {
    match self {
      Ok(value) => value,
      Err(never) => match never {},
    }
  }
}

pub fn js_error_downcast_ref(
  err: &AnyError,
) -> Option<&oden_runtime::oden_core::error::JsError> {
  any_and_jserrorbox_downcast_ref(err)
    .or_else(|| {
      err
        .downcast_ref::<CoreError>()
        .and_then(|e| match e.as_kind() {
          CoreErrorKind::Js(e) => Some(e),
          _ => None,
        })
    })
    .map(|v| &**v)
}

pub fn any_and_jserrorbox_downcast_ref<
  E: std::error::Error + Send + Sync + 'static,
>(
  err: &AnyError,
) -> Option<&E> {
  err
    .downcast_ref::<E>()
    .or_else(|| {
      err
        .downcast_ref::<JsErrorBox>()
        .and_then(|e| e.get_ref().downcast_ref::<E>())
    })
    .or_else(|| {
      err
        .downcast_ref::<CoreError>()
        .and_then(|e| match e.as_kind() {
          CoreErrorKind::JsBox(e) => e.get_ref().downcast_ref::<E>(),
          _ => None,
        })
    })
}

pub fn downcast_ref_oden_resolve_error(
  err: &JsErrorBox,
) -> Option<&OdenResolveErrorKind> {
  err
    .get_ref()
    .downcast_ref::<OdenResolveError>()
    .map(|e| e.as_kind())
    .or_else(|| err.get_ref().downcast_ref::<OdenResolveErrorKind>())
}
