// Copyright 2018-2026 the Oden authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:oden_node/os.ts");

export const {
  constants,
  arch,
  cpus,
  endianness,
  freemem,
  getPriority,
  homedir,
  hostname,
  loadavg,
  networkInterfaces,
  machine,
  platform,
  release,
  setPriority,
  tmpdir,
  totalmem,
  type,
  uptime,
  userInfo,
  version,
  availableParallelism,
  EOL,
  devNull,
} = mod;

export default mod.default;
