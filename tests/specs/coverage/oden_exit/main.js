// Regression test for https://github.com/denoland/deno/issues/32590
// Coverage data should be written even when Oden.exit() is called.
function add(a, b) {
  return a + b;
}

function unused() {
  return "never called";
}

add(1, 2);
console.log("calling Oden.exit()");
Oden.exit(0);
