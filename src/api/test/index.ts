import { Hono } from "hono";
import { authMiddleware } from "../../middleware";
import { AppEnv, AppHono, AppVariables } from "../../type/hono";

const app: AppHono = new Hono<{ Variables: AppVariables; Bindings: AppEnv }>();

// 公開APIエンドポイント（認証不要）
app.get("/public", (c) => {
  return c.json({ message: "誰でもアクセスできます" });
});

// プライベートAPIエンドポイント（認証必要）
app.use("/private/*", authMiddleware);

app.get("/private/profile", (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "ユーザー情報がありません" }, 401);
  }

  return c.json({
    message: "認証済みユーザーのみアクセス可能",
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

export default app;
