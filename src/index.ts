import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import v1 from "./version/v1";
import { AppHono } from "./type/hono";

const app: AppHono = new Hono();

app.use("*", prettyJSON());

app.route("/v1", v1);

app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});

export default app;
