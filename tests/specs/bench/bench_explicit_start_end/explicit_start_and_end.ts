Oden.bench("start and end", (t) => {
  const id = setInterval(() => {}, 1000);
  t.start();
  Oden.inspect(id);
  t.end();
  clearInterval(id);
});

Oden.bench("start only", (t) => {
  const id = setInterval(() => {}, 1000);
  t.start();
  Oden.inspect(id);
  clearInterval(id);
});

Oden.bench("end only", (t) => {
  const id = setInterval(() => {}, 1000);
  Oden.inspect(id);
  t.end();
  clearInterval(id);
});

Oden.bench("double start", (t) => {
  const id = setInterval(() => {}, 1000);
  t.start();
  t.start();
  Oden.inspect(id);
  t.end();
  clearInterval(id);
});

let captured: Oden.BenchContext;

Oden.bench("double end", (t) => {
  captured = t;
  const id = setInterval(() => {}, 1000);
  t.start();
  Oden.inspect(id);
  t.end();
  t.end();
  clearInterval(id);
});

Oden.bench("captured", () => {
  const id = setInterval(() => {}, 1000);
  captured!.start();
  Oden.inspect(id);
  captured!.end();
  clearInterval(id);
});
