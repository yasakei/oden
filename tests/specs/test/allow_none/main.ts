import { unreachable } from "@std/assert";

const permissions: Oden.PermissionName[] = [
  "read",
  "write",
  "net",
  "env",
  "run",
  "ffi",
];

for (const name of permissions) {
  Oden.test({
    name,
    permissions: {
      [name]: true,
    },
    fn() {
      unreachable();
    },
  });
}
