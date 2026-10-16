const server = Oden.serve({
  handler: () => new Response(),
  hostname: "::1",
  port: 0,
});
await server.shutdown();
