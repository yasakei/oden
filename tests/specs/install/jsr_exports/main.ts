import { add } from "@odentest/multiple-exports/add";
import { subtract } from "@odentest/multiple-exports/subtract";
import data from "@odentest/multiple-exports/data-json" with { type: "json" };

console.log(add(1, 2));
console.log(subtract(1, 2));
console.log(data);
