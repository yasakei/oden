const status = await Oden.permissions.query({ name: "read", path: "foo" });
console.log(status.state);
status.onchange = () => console.log(status.state);
await Oden.permissions.request({ name: "read", path: "foo" }); // y
await Oden.permissions.revoke({ name: "read", path: "foo" });
