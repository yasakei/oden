import { sayHello as sayHelloVuln2 } from "@odentest/with-vuln2";

export function sayHello() {
  return sayHelloVuln2();
}