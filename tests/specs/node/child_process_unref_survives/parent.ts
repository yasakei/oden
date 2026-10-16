import { spawn } from "node:child_process";
import { join } from "node:path";

const markerFile = join(Oden.cwd(), "marker.txt");
const child = spawn(Oden.execPath(), [
  "run",
  "--allow-write",
  join(import.meta.dirname!, "child.ts"),
  markerFile,
], { stdio: "ignore" });

child.unref();
// Parent exits immediately — child should continue running and create the marker file.
