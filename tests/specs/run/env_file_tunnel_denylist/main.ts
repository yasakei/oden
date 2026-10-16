// The denylisted Oden control variables must not have been imported from the
// env file...
console.log("ODEN_CONNECTED:", Oden.env.get("ODEN_CONNECTED"));
console.log(
  "ODEN_DEPLOY_TUNNEL_ENDPOINT:",
  Oden.env.get("ODEN_DEPLOY_TUNNEL_ENDPOINT"),
);
// ...but ordinary variables from the same file still are.
console.log("NOT_DENYLISTED:", Oden.env.get("NOT_DENYLISTED"));
console.log("user code started");
