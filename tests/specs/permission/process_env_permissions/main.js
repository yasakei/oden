console.log(Oden.env.get("MYAPP_HELLO"));
console.log(Oden.env.get("MYAPP_GOODBYE"));
Oden.env.set("MYAPP_TEST", "done");
Oden.env.set("MYAPP_DONE", "done");
console.log(Oden.env.get("MYAPP_DONE"));
