await using server = Oden.serve({
  transport: "vsock",
  cid: -1,
  port: 1234567,
}, (req) => {
  return new Response(req.url);
});

await new Oden.Command(Oden.execPath(), {
  args: ["run", "-A", "client.ts"],
  env: {
    "ALL_PROXY": "vsock:1:1234567",
  },
  stderr: "inherit",
  stdout: "inherit",
}).output();
