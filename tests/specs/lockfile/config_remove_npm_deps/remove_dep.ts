const arg = Oden.args[0];
const filePath = import.meta.dirname + "/oden.json";
const odenJson = JSON.parse(Oden.readTextFileSync(filePath));
if (!(arg in odenJson.imports)) {
  throw new Error("Not found: " + arg);
}
delete odenJson.imports[arg];
Oden.writeTextFileSync(filePath, JSON.stringify(odenJson));
