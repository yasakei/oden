const status1 = await Oden.permissions.query({ name: "net" });
console.log(status1);
const status2 = await Oden.permissions.revoke({ name: "net" });
console.log(status2);
const status3 = await Oden.permissions.query({ name: "net" });
console.log(status3);
