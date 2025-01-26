import { Hono } from "hono";

import pokemon from "../../api/pokemon";
import types from "../../api/types";
import pickup from "../../api/pickup";

const app = new Hono();

app.route("/pokemon", pokemon);
app.route("/pokemon-type", types);
app.route("/pickup", pickup);

export default app;
