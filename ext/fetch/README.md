# oden_fetch

**This crate implements the Fetch API.**

Spec: https://fetch.spec.whatwg.org/

## Usage Example

From javascript, include the extension's source, and assign the following
properties to the global scope:

```javascript
import { core } from "ext:core/mod.js";

const headers = core.loadExtScript("ext:oden_fetch/20_headers.js");
const formData = core.loadExtScript("ext:oden_fetch/21_formdata.js");
const request = core.loadExtScript("ext:oden_fetch/23_request.js");
const response = core.loadExtScript("ext:oden_fetch/23_response.js");
const fetch = core.loadExtScript("ext:oden_fetch/26_fetch.js");
const eventSource = core.loadExtScript("ext:oden_fetch/27_eventsource.js");

// Set up the callback for Wasm streaming ops
core.setWasmStreamingCallback(fetch.handleWasmStreaming);

Object.defineProperty(globalThis, "fetch", {
  value: fetch.fetch,
  enumerable: true,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, "Request", {
  value: request.Request,
  enumerable: false,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, "Response", {
  value: response.Response,
  enumerable: false,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, "Headers", {
  value: headers.Headers,
  enumerable: false,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, "FormData", {
  value: formData.FormData,
  enumerable: false,
  configurable: true,
  writable: true,
});
```

Then from rust, provide `oden_fetch::oden_fetch::init(Default::default())` in
the `extensions` field of your `RuntimeOptions`

Where:

- Options: `oden_fetch::Options`, which implements `Default`

## Dependencies

- **oden_webidl**: Provided by the `oden_webidl` crate
- **oden_web**: Provided by the `oden_web` crate
- **oden_console**: Provided by the `oden_console` crate

## Provided ops

Following ops are provided, which can be accessed through `Oden.ops`:

- op_fetch
- op_fetch_send
- op_utf8_to_byte_string
- op_fetch_custom_client
- op_fetch_promise_is_settled
