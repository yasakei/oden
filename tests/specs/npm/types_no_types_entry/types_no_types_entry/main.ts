import { getValue } from "npm:@odentest/types-no-types-entry";

// should error here
const result: string = getValue();
console.log(result);
