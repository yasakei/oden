const status1 =
  Oden.permissions.requestSync({ name: "run", command: "ls" }).state;
if (status1 != "granted") {
  throw Error(`unexpected status1 ${status1}`);
}
const status2 =
  Oden.permissions.querySync({ name: "run", command: "cat" }).state;
if (status2 != "prompt") {
  throw Error(`unexpected status2 ${status2}`);
}
const status3 =
  Oden.permissions.requestSync({ name: "run", command: "cat" }).state;
if (status3 != "denied") {
  throw Error(`unexpected status3 ${status3}`);
}
console.log(status1);
console.log(status2);
console.log(status3);
