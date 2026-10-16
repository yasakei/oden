const status1 =
  Oden.permissions.requestSync({ name: "read", path: "foo" }).state;
const status2 = Oden.permissions.querySync({ name: "read", path: "bar" }).state;
const status3 =
  Oden.permissions.requestSync({ name: "read", path: "bar" }).state;
console.log(status1);
console.log(status2);
console.log(status3);
