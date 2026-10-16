const add = (a: number, b: number) => a + b;

Oden.test(function addTest() {
  if (add(2, 3) !== 5) {
    throw new Error("fail");
  }
});
