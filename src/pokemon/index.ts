import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return new Response(
    JSON.stringify({ message: "Hello, Hono!", res: c.req.query() }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
});

export default app;
