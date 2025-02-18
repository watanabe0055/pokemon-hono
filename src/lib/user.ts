import type { SupabaseClient } from "@supabase/supabase-js";

// トークンからユーザー取得のヘルパー関数
export const getUserFromToken = async (
  supabase: SupabaseClient,
  authHeader: string | undefined
) => {
  if (!authHeader) {
    throw new Error("認証ヘッダーがありません");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new Error("トークンが見つかりません");
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("ユーザー認証に失敗しました");
  }

  return data.user;
};
