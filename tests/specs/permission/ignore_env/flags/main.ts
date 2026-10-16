console.log(Oden.env.get("VAR1"));
console.log(Oden.env.get("VAR2"));
const object = Oden.env.toObject();
console.log(object);
if ("VAR1" in object) {
  throw "FAILED";
}
