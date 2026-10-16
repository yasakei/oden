const filePath = import.meta.dirname + "/oden.lock";
console.log(Oden.readTextFileSync(filePath).trim());
