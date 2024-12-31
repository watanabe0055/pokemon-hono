import { Hono } from "hono";

import pokemon from "../../api/pokemon";
import types from "../../api/types";

const app = new Hono();

app.route("/pokemon", pokemon);
app.route("/pokemon-type", types);

export default app;
