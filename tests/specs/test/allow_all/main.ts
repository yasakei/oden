import { assertEquals } from "@std/assert";

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
    name: `${name} false`,
    permissions: {
      [name]: false,
    },
    async fn() {
      for await (const n of permissions) {
        const status = await Oden.permissions.query({ name: n });
        assertEquals(status.state, "prompt");
      }
    },
  });

  Oden.test({
    name: `${name} true`,
    permissions: {
      [name]: true,
    },
    async fn() {
      for await (const n of permissions) {
        const status = await Oden.permissions.query({ name: n });
        if (n === name) {
          assertEquals(status.state, "granted");
        } else {
          assertEquals(status.state, "prompt");
        }
      }
    },
  });
}
