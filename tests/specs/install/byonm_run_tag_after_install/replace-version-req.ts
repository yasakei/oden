const newReq = Oden.args[0]?.trim();
if (!newReq) {
  throw new Error("Missing required argument");
}
const config = JSON.parse(Oden.readTextFileSync("oden.json"));
config.imports["@odentest/esm-basic"] = `npm:@odentest/esm-basic@${newReq}`;
Oden.writeTextFileSync("oden.json", JSON.stringify(config));
