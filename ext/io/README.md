# oden_io

**This crate provides IO primitives for other Oden extensions, this includes
stdio streams and abstraction over File System files.**

## Usage Example

From javascript, include the extension's source:

```javascript
import { core } from "ext:core/mod.js";

const io = core.loadExtScript("ext:oden_io/12_io.js");
```

Then from rust, provide: `oden_io::oden_io::init(Option<oden_io::Stdio>)` in the
`extensions` field of your `RuntimeOptions`

Where `oden_io::Stdio` implements `Default`, and can therefore be provided as
`Some(oden_io::Stdio::default())`

## Dependencies

- **oden_web**: Provided by the `oden_web` crate
- **oden_tty**: Provided in `oden/runtime/ops/tty.rs`
