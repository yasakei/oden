const p = JSON.parse(Oden.readTextFileSync("package.json"));
console.log(p.dependencies["@odentest/with-vuln1"]);
