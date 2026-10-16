export default {
  fetch(_req) {
    return new Response("ok");
  },
} satisfies Oden.ServeDefaultExport;
