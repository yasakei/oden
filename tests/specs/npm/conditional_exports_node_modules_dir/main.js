import mod from "npm:@odentest/conditional-exports";
import foo from "npm:@odentest/conditional-exports/foo.js";
import client from "npm:@odentest/conditional-exports/client";
import clientFoo from "npm:@odentest/conditional-exports/client/foo";
import clientBar from "npm:@odentest/conditional-exports/client/bar";
import clientM from "npm:@odentest/conditional-exports/client/m";
import supportsESM from "npm:supports-esm";

console.log(mod);
console.log(foo);
console.log(client);
console.log(clientFoo);
console.log(clientBar);
console.log(clientM);
console.log(supportsESM);
