import * as it from "tape";

if (typeof(window) === "object") {
    const tapeDom = require("tape-dom");
    tapeDom.installCSS();
    tapeDom.stream(it);
}

import "./bindingProvider-spec";