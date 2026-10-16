// Copyright 2018-2026 the Oden authors. MIT license.
import "./main.js";
import { barrierAwait } from "checkin:async";
await barrierAwait("barrier");
console.log("done");
