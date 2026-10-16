const status1 = await Oden.permissions.request({ name: "read" });
console.log(status1);
const status2 = await Oden.permissions.query({ name: "read", path: "foo" });
console.log(status2);
const status3 = await Oden.permissions.query({ name: "read", path: "bar" });
console.log(status3);
