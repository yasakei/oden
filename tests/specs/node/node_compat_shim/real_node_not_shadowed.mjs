// When a real `node` is already on PATH, Oden must not shadow it. Stage a fake
// `node`, re-run oden with only that directory on PATH, and confirm the native
// spawn inside spawn_node.mjs reaches the fake binary rather than oden's shim
// (which would have printed NODE_OK from the `-e` snippet).
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const binDir = mkdtempSync(join(tmpdir(), "fakenode-"));
const fakeNode = join(binDir, "node");
writeFileSync(fakeNode, "#!/bin/sh\necho REAL_NODE_USED\n");
chmodSync(fakeNode, 0o755);

const result = spawnSync(Oden.execPath(), ["run", "-A", "spawn_node.mjs"], {
  encoding: "utf8",
  env: { ...process.env, PATH: binDir },
});
process.stdout.write(result.stdout);
