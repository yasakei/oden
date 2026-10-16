self.onmessage = async () => {
  const env = await Oden.permissions.query({ name: "env" });
  const ffi = await Oden.permissions.query({ name: "ffi" });
  const net = await Oden.permissions.query({ name: "net" });
  const read = await Oden.permissions.query({ name: "read" });
  const run = await Oden.permissions.query({ name: "run" });
  const write = await Oden.permissions.query({ name: "write" });
  const imports = await Oden.permissions.query({ name: "import" });
  self.postMessage({
    env: env.state,
    ffi: ffi.state,
    net: net.state,
    read: read.state,
    run: run.state,
    write: write.state,
    import: imports.state,
  });
  self.close();
};
