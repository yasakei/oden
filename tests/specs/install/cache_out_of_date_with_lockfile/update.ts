const path = Oden.args[0] + "/npm/localhost_4260/@odentest/bin/registry.json";
const fileText = Oden.readTextFileSync(path);
const data = JSON.parse(fileText);
if (data.versions["1.0.0"] == null || data["dist-tags"].latest !== "1.0.0") {
  throw new Error("Test relies on version 1.0.0 to be the latest version");
}
delete data.versions["1.0.0"];
data["dist-tags"].latest = "0.5.0";
delete data["_oden.etag"];
Oden.writeTextFileSync(path, JSON.stringify(data));
Oden.remove("node_modules", { recursive: true });

// assert this exists
if (!Oden.statSync("oden.lock").isFile) {
  throw new Error("Expected a oden.lock file.");
}
