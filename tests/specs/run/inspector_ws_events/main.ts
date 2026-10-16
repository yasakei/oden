// Get an open port
const listener = Oden.listen({ port: 0 });
const port = (listener.addr as Oden.NetAddr).port;
listener.close();

new Oden.Command(Oden.execPath(), {
  args: ["run", "--inspect=127.0.0.1:" + port, "--watch", "a.ts"],
  stdin: "null",
  stdout: "null",
  stderr: "null",
}).spawn();

// Wait a bit for the inspector server to be ready
await new Promise((r) => setTimeout(r, 500));

const ws = new WebSocket(`ws://127.0.0.1:${port}/ws/events`);
ws.onopen = async () => {
  console.log("connected");
  await Oden.writeTextFile("a.ts", `console.log("bar");`);
};
ws.onmessage = (msg) => {
  console.log("message", msg.data);
  Oden.exit();
};

ws.onerror = (e) => {
  console.log("connection_failed");
  Oden.exit();
};
