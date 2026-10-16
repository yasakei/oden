// ensure this is properly set in a worker
const value: boolean = Oden.build.standalone;
console.log(value);
self.close();
