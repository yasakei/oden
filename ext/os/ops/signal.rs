// Copyright 2018-2026 the Oden authors. MIT license.
use std::borrow::Cow;
use std::cell::RefCell;
use std::rc::Rc;

use oden_core::AsyncRefCell;
use oden_core::OpState;
use oden_core::RcRef;
use oden_core::Resource;
use oden_core::ResourceId;
use oden_core::error::ResourceError;
use oden_core::op2;

#[derive(Debug, thiserror::Error, deno_error::JsError)]
pub enum SignalError {
  #[class(type)]
  #[error(transparent)]
  InvalidSignalStr(#[from] oden_signals::InvalidSignalStrError),
  #[class(type)]
  #[error(transparent)]
  InvalidSignalInt(#[from] oden_signals::InvalidSignalIntError),
  #[class(type)]
  #[error("Binding to signal '{0}' is not allowed")]
  SignalNotAllowed(String),
  #[class(inherit)]
  #[error("{0}")]
  Io(#[from] std::io::Error),
}

struct SignalStreamResource {
  signo: i32,
  id: u32,
  rx: AsyncRefCell<tokio::sync::watch::Receiver<()>>,
}

impl Resource for SignalStreamResource {
  fn name(&self) -> Cow<'_, str> {
    "signal".into()
  }

  fn close(self: Rc<Self>) {
    oden_signals::unregister(self.signo, self.id);
  }
}

impl Drop for SignalStreamResource {
  fn drop(&mut self) {
    oden_signals::unregister(self.signo, self.id);
  }
}

#[op2(fast)]
#[smi]
pub fn op_signal_bind(
  state: &mut OpState,
  #[string] sig: &str,
) -> Result<ResourceId, SignalError> {
  let signo = oden_signals::signal_str_to_int(sig)?;
  if oden_signals::is_forbidden(signo) {
    return Err(SignalError::SignalNotAllowed(sig.to_string()));
  }

  let (tx, rx) = tokio::sync::watch::channel(());
  let id = oden_signals::register(
    signo,
    true,
    Box::new(move || {
      let _ = tx.send(());
    }),
  )?;

  let rid = state.resource_table.add(SignalStreamResource {
    signo,
    id,
    rx: AsyncRefCell::new(rx),
  });

  Ok(rid)
}

#[op2]
pub async fn op_signal_poll(
  state: Rc<RefCell<OpState>>,
  #[smi] rid: ResourceId,
) -> Result<bool, ResourceError> {
  let resource = state
    .borrow_mut()
    .resource_table
    .get::<SignalStreamResource>(rid)?;

  let mut rx = RcRef::map(&resource, |r| &r.rx).borrow_mut().await;

  Ok(rx.changed().await.is_err())
}

#[op2(fast)]
pub fn op_signal_unbind(
  state: &mut OpState,
  #[smi] rid: ResourceId,
) -> Result<(), ResourceError> {
  let resource = state.resource_table.take::<SignalStreamResource>(rid)?;
  resource.close();
  Ok(())
}
