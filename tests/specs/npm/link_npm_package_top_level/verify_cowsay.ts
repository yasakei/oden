// Ensure local cowsay package is not modified.
function compareAndLog(pathA, pathB) {
  const contentA = Oden.readTextFileSync(pathA);
  const contentB = Oden.readTextFileSync(pathB);
  const equals = contentA === contentB;

  console.log(equals);

  // Log to debug easily.
  if (!equals) {
    console.log(`Content mismatch between ${pathA} and ${pathB}`);
    console.log(`contentA: ${contentA}`);
    console.log(`contentB: ${contentB}`);
  }
}

compareAndLog("./cowsay_backup/main.mjs", "./cowsay/main.mjs");
compareAndLog("./cowsay_backup/package.json", "./cowsay/package.json");
