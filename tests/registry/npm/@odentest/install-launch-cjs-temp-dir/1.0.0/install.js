const tempDir = Oden.makeTempDirSync();
try {
  // should work requiring these because this was launched via a node binary entrypoint
  Oden.writeTextFileSync(`${tempDir}/index.js`, "module.exports = require('./other');");
  Oden.writeTextFileSync(`${tempDir}/other.js`, "module.exports = (a, b) => a + b;");
  const add = require(`${tempDir}/index.js`);
  if (add(1, 2) !== 3) {
    throw new Error("FAILED");
  }
} finally {
  Oden.removeSync(tempDir, { recursive: true });
}
