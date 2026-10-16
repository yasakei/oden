try {
  Oden.readTextFileSync("./oden.json");
  console.log("loaded");
} catch (err) {
  console.log(err instanceof Oden.errors.NotFound);
}

try {
  Oden.readTextFileSync("data.txt");
  console.log("loaded");
} catch (err) {
  console.log(err instanceof Oden.errors.NotFound);
}
