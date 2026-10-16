// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript(
  "ext:oden_node/internal/streams/transform.js",
);

export const Transform = mod.Transform;
export default mod.default;
