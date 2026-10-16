// @ts-expect-error - testing runtime validation
Oden.test.each({ not: "an array" })("name", () => {});
