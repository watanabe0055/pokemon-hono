import { Hono } from "hono";

import pokemon from "../../pokemon/index";

const app = new Hono();

app.route("/pokemon", pokemon);

export default app;
