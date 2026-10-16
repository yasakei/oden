// should inherit from root
console.log(
  "Root:",
  Oden.permissions.querySync({
    name: "read",
    path: import.meta.dirname + "/../data",
  }).state,
);
console.log(
  "Member:",
  Oden.permissions.querySync({
    name: "read",
    path: import.meta.dirname + "/other",
  }).state,
);
