// Test-only loader: a .css import resolves to an empty module, since the tests render HTML, not styles.
import { register } from "node:module";
register(new URL("./css-noop-hooks.mjs", import.meta.url));
