const file = Oden.args[0].trim();
const importKey = Oden.args[1].trim();
const newValue = Oden.args[2].trim();
const json = JSON.parse(Oden.readTextFileSync(file));
json["imports"][importKey] = newValue;
Oden.writeTextFileSync(file, JSON.stringify(json));
