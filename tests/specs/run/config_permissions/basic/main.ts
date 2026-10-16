console.log(Oden.permissions.querySync({ name: "read", path: "./data" }).state);
console.log(Oden.permissions.querySync({ name: "read", path: "." }).state);
console.log(
  Oden.permissions.querySync({ name: "write", path: "./data" }).state,
);
console.log(Oden.permissions.querySync({ name: "write", path: "." }).state);
