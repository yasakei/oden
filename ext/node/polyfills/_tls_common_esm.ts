// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/_tls_common.ts");

export const SecureContext = mod.SecureContext;
export const createSecureContext = mod.createSecureContext;
export const translatePeerCertificate = mod.translatePeerCertificate;

export default mod.default;
