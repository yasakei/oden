const main = import.meta.main;
const url = import.meta.url;

Oden.test("check values", () => {
  console.log("import.meta.main: %s", main);
  console.log("import.meta.url: %s", url);
});
