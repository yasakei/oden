declare global {
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
const React = {
  createElement(factory: any, props: any, ...children: any[]) {
    return { factory, props, children };
  },
};
const View = () => <div class="oden">land</div>;
console.log(<View />);
