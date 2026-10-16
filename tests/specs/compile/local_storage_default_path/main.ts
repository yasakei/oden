// `localStorage` should be available in a compiled binary and persist across
// runs, keyed by the app identity (no `--location` required).
if (Oden.args[0] === "set") {
  localStorage.setItem("greeting", "hi oden team.");
  console.log("set");
} else {
  console.log("value:", localStorage.getItem("greeting"));
}
