export default {
  fetch() {
    return new Response("Hello, world!");
  },
  onListen() {
    console.log("Listening");
    Oden.exit(0);
  },
} satisfies Oden.ServeDefaultExport;
