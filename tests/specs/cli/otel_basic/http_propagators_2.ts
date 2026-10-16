Oden.serve({
  onListen() {
    Oden.writeTextFileSync(Oden.args[0], "started");
  },
  port: 8001,
}, (req) => {
  console.log("server 2");
  setTimeout(() => Oden.exit(0), 1000);
  return new Response("Hello World!");
});
