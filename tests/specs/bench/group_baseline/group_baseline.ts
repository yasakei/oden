Oden.bench("noop", () => {});
Oden.bench("noop2", { baseline: true }, () => {});

Oden.bench("noop3", { group: "url" }, () => {});

Oden.bench("parse url 2x", { group: "url", baseline: true }, () => {
  new URL("https://deno.land/std/http/server.ts");
  new URL("https://deno.land/std/http/server.ts");
});

Oden.bench("parse url 200x", { group: "url" }, () => {
  for (let i = 0; i < 200; i++) {
    new URL("https://deno.land/std/http/server.ts");
  }
});
