// Copyright 2018-2026 the Oden authors. MIT license.

use oden_core::OpState;
use oden_core::op2;
use oden_core::v8;

mod bitmaprenderer;
pub mod byow;
mod canvas;

oden_core::extension!(
  oden_canvas,
  deps = [oden_webidl, oden_web, oden_webgpu],
  ops = [op_init_canvas],
  objects = [
    bitmaprenderer::ImageBitmapRenderingContext,
    canvas::OffscreenCanvas,
    byow::UnsafeWindowSurface,
  ],
  lazy_loaded_esm = ["01_canvas.js"],
  lazy_loaded_js = ["02_surface.js"],
);

#[op2(fast)]
pub fn op_init_canvas(
  state: &mut OpState,
  scope: &mut v8::PinScope<'_, '_>,
  blob: v8::Local<v8::Value>,
) {
  state.put(canvas::BlobHandle(v8::Global::new(scope, blob.cast())));
}
