const specifier = "npm:@odentest/add";
const { add } = await import(specifier);

console.log(add(1, 2));
