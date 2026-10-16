// Copyright 2018-2026 the Oden authors. MIT license.

import { core } from "ext:core/mod.js";
import {
  ImageBitmapRenderingContext,
  OffscreenCanvas,
  op_init_canvas,
} from "ext:core/ops";

const { Blob } = core.loadExtScript("ext:oden_web/09_file.js");

op_init_canvas(Blob);

export { ImageBitmapRenderingContext, OffscreenCanvas };
