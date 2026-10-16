const React = {
  createElement(factory, props, ...children) {
    return { factory, props, children };
  },
};
const View = () => <div class="oden">land</div>;
console.log(<View />);
