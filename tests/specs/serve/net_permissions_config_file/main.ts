export default {
  async fetch(_req) {
    return new Response("Hello world!");
  },
} satisfies Oden.ServeDefaultExport;

function checkNetPermission(host: string) {
  console.log(
    host,
    Oden.permissions.querySync({
      name: "net",
      host,
    }).state,
  );
}

checkNetPermission("github.com");
checkNetPermission("google.com");
checkNetPermission("localhost:1234");
checkNetPermission("localhost:12818");
Oden.exit(0);
