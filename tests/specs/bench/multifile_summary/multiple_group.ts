Oden.bench("noop", { group: "noop" }, () => {});
Oden.bench("noop2", { group: "noop", baseline: true }, () => {});

Oden.bench("noop3", { group: "url" }, () => {});

Oden.bench("parse url 2x", { group: "url", baseline: true }, () => {
  new URL("https://jsr.io/@std/http/0.221.0/file_server.ts");
  new URL("https://jsr.io/@std/http/0.221.0/file_server.ts");
});

Oden.bench("parse url 200x", { group: "url" }, () => {
  for (let i = 0; i < 200; i++) {
    new URL("https://jsr.io/@std/http/0.221.0/file_server.ts");
  }
});
