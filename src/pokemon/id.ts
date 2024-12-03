import { Hono } from "hono";
import { requestId } from "hono/request-id";

const app = new Hono();
app.use("*", requestId());

// 動的パス定義
app.get("/:id", async (c) => {
  const id = c.req.param("id"); // URL の ":id" 部分を取得
  console.log("Extracted ID:", id);

  return c.text(`The ID is ${id}`);
});

export default app;
