import { assertEquals } from "jsr:@std/assert";

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

  Oden.bench({
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
