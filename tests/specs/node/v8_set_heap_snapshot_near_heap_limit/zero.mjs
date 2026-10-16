import v8 from "node:v8";

try {
  v8.setHeapSnapshotNearHeapLimit(0);
} catch (err) {
  if (err?.code === "ERR_OUT_OF_RANGE") {
    console.log("zero-limit-rejected");
    Oden.exit(0);
  }
  console.error(err);
  Oden.exit(1);
}

console.error("setHeapSnapshotNearHeapLimit(0) did not throw");
Oden.exit(1);
