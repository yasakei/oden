import addPkg from "npm:@odentest/add@latest/package.json" with {
  type: "json",
};
console.log(addPkg.version);
