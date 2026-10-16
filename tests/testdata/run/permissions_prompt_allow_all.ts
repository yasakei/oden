Oden.permissions.requestSync({ name: "run", command: "FOO" });
Oden.permissions.requestSync({ name: "run", command: "BAR" });

Oden.permissions.requestSync({ name: "read", path: "FOO" });
Oden.permissions.requestSync({ name: "read", path: "BAR" });

Oden.permissions.requestSync({ name: "write", path: "FOO" });
Oden.permissions.requestSync({ name: "write", path: "BAR" });

Oden.permissions.requestSync({ name: "net", host: "FOO" });
Oden.permissions.requestSync({ name: "net", host: "BAR" });

Oden.permissions.requestSync({ name: "env", variable: "FOO" });
Oden.permissions.requestSync({ name: "env", variable: "BAR" });

Oden.permissions.requestSync({ name: "sys", kind: "loadavg" });
Oden.permissions.requestSync({ name: "sys", kind: "hostname" });

Oden.permissions.requestSync({ name: "ffi", path: "FOO" });
Oden.permissions.requestSync({ name: "ffi", path: "BAR" });
