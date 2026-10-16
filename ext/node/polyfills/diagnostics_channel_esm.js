// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/diagnostics_channel.js");

export const {
  channel,
  hasSubscribers,
  subscribe,
  tracingChannel,
  unsubscribe,
  Channel,
} = mod;

export default mod.default;
