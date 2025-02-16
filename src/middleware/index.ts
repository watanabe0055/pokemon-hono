import type { Context, Next } from "hono";
import { createClient } from "@supabase/supabase-js";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    console.log("Authorization ヘッダーなし");
    return c.json({ message: "認証が必要です" }, 401);
  }

  const token = authHeader.split(" ")[1];
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log("認証失敗:", error?.message || "ユーザーなし");
      return c.json({ message: "無効なトークンです" }, 401);
    }

    // console.log("認証成功:", user);

    c.set("user", user);
    await next();
  } catch (error) {
    console.log("認証処理中にエラー:", error);
    return c.json({ message: "認証エラーが発生しました" }, 401);
  }
};
