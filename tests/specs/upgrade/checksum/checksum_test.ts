// Test script that fetches the upgrade zip, computes its checksum,
// and then runs upgrade commands to verify checksum validation works.

const version = "99.99.99";
const target = Oden.build.target;
const archiveName = `oden-${target}.zip`;
const downloadUrl =
  `http://localhost:4545/oden-upgrade/download/v${version}/${archiveName}`;

// Fetch the archive and compute its SHA256 checksum
const response = await fetch(downloadUrl);
if (!response.ok) {
  console.error(`Failed to fetch ${downloadUrl}: ${response.status}`);
  Oden.exit(1);
}

const data = new Uint8Array(await response.arrayBuffer());
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const correctChecksum = hashArray.map((b) => b.toString(16).padStart(2, "0"))
  .join("");

console.log(`Downloaded ${data.length} bytes`);
console.log(`Computed checksum: ${correctChecksum}`);

async function runUpgrade(args: string[]) {
  const command = new Oden.Command(Oden.execPath(), {
    args: ["upgrade", ...args],
    env: {
      ...Oden.env.toObject(),
      "ODEN_TESTING_UPGRADE": "1",
    },
    stdout: "inherit",
    stderr: "inherit",
  });

  await command.output();
}

console.log("\n=== Test 1: Valid checksum ===");
await runUpgrade([
  "--version",
  version,
  "--dry-run",
  "--checksum",
  correctChecksum,
]);

console.log("\n=== Test 2: Invalid checksum ===");
await runUpgrade([
  "--version",
  version,
  "--dry-run",
  "--checksum",
  "0000000000000000000000000000000000000000000000000000000000000000",
]);

console.log("\n=== Test 3: Uppercase checksum ===");
await runUpgrade([
  "--version",
  version,
  "--dry-run",
  "--checksum",
  correctChecksum.toUpperCase(),
]);
