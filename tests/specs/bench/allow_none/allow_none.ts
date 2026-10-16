const permissions: Oden.PermissionName[] = [
  "read",
  "write",
  "net",
  "env",
  "run",
  "ffi",
];

for (const name of permissions) {
  Oden.bench({
    name,
    permissions: {
      [name]: true,
    },
    fn() {
      throw new Error("unreachable");
    },
  });
}
