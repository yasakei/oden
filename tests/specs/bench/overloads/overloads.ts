Oden.bench("bench0", () => {});
Oden.bench(function bench1() {});
Oden.bench({ name: "bench2", fn: () => {} });
Oden.bench("bench3", { permissions: "none" }, () => {});
Oden.bench({ name: "bench4" }, () => {});
Oden.bench({ ignore: true }, function bench5() {});
