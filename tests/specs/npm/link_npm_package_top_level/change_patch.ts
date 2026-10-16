const filePath = "./cowsay/package.json";
const packageJson = JSON.parse(Oden.readTextFileSync(filePath));
packageJson.dependencies = {
  "@odentest/add": "1",
};
Oden.writeTextFileSync(filePath, JSON.stringify(packageJson));
