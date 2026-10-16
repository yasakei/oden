import { getValue } from "npm:@odentest/types-exports-import-types";

// should error here
const result: string = getValue();
console.log(result);
