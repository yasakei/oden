import { getValue } from "npm:@odentest/types-entry-value-not-exists";

// should error here
const result: string = getValue();
console.log(result);
