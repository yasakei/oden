Oden.readTextFileSync("./run/permission_broker/scratch.txt");
Oden.readTextFileSync("./run/permission_broker/scratch.txt");
Oden.readTextFileSync("./run/permission_broker/log.txt");
Oden.writeTextFileSync(
  "./run/permission_broker/log.txt",
  "Lorem ipsum dolor sit amet",
);
console.log("env", Oden.env.toObject());
