self.onmessage = async () => {
  const net = await Oden.permissions.query({ name: "net" });
  const ffi = await Oden.permissions.query({ name: "ffi" });
  const read = await Oden.permissions.query({ name: "read" });
  const run = await Oden.permissions.query({ name: "run" });
  const write = await Oden.permissions.query({ name: "write" });
  const imports = await Oden.permissions.query({ name: "import" });
  self.postMessage(
    net.state === "prompt" &&
      ffi.state === "prompt" &&
      read.state === "prompt" &&
      run.state === "prompt" &&
      write.state === "prompt" &&
      imports.state === "prompt",
  );
  self.close();
};
