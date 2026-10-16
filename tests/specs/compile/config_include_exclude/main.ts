const dataDir = import.meta.dirname + "/data";
const files = Array.from(
  Oden.readDirSync(dataDir).map((entry) => dataDir + "/" + entry.name),
);
files.sort();
for (const file of files) {
  console.log(Oden.readTextFileSync(file).trim());
}
