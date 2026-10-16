import { createContext } from "npm:@odentest/types-pkg-json-import";
import { useContext } from "npm:@odentest/types-pkg-json-import/hooks";

export interface Foo {
  foo: string;
}

export const CTX = createContext<Foo | undefined>(undefined);

function unwrap(foo: Foo) {}

export function useCSP() {
  const foo = useContext(CTX);
  // previously this was erroring
  if (foo) {
    unwrap(foo);
  }
}
