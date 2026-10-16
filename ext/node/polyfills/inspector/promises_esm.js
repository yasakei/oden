// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/inspector/promises.js");

export const Session = mod.Session;
export const close = mod.close;
export const console = mod.console;
export const DOMStorage = mod.DOMStorage;
export const Network = mod.Network;
export const open = mod.open;
export const url = mod.url;
export const waitForDebugger = mod.waitForDebugger;

export default mod;
