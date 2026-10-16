import { addAsync } from "jsr:@odentest/worker";

addAsync(1, 2).then((result) => {
  console.log(result);
});
