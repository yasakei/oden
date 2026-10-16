const status1 = Oden.permissions.revokeSync({ name: "read", path: "foo" });
console.log(status1);
const status2 = Oden.permissions.querySync({ name: "read", path: "bar" });
console.log(status2);
const status3 = Oden.permissions.revokeSync({ name: "read", path: "bar" });
console.log(status3);
