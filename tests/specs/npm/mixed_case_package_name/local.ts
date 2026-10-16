import value from "npm:@odentest/MixedCase";
console.log(value);
console.log(pathExists("./node_modules/.oden"));
console.log(
  pathExists("./node_modules/.oden/_ibsgk3tporsxg5bpinavaskuifgfg@1.0.0"),
);

function pathExists(filePath: string) {
  try {
    Oden.lstatSync(filePath);
    return true;
  } catch (error) {
    if (error instanceof Oden.errors.NotFound) {
      return false;
    }
    throw error;
  }
}
