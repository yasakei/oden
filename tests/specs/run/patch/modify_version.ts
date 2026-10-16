const data = JSON.parse(Oden.readTextFileSync("./add/oden.json"));
data.version = "2.0.0";
Oden.writeTextFileSync("./add/oden.json", JSON.stringify(data, null, 2));
