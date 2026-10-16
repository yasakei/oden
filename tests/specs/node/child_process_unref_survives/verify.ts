import { join } from "node:path";

// Wait for the child to finish writing the marker file.
const markerFile = join(Oden.cwd(), "marker.txt");
for (let i = 0; i < 20; i++) {
  try {
    const content = Oden.readTextFileSync(markerFile);
    if (content === "child was here") {
      console.log("OK: child process survived parent exit");
      Oden.exit(0);
    }
  } catch {
    // File doesn't exist yet, wait and retry
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}
console.log("FAIL: marker file was not created");
Oden.exit(1);
