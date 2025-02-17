import { createClient } from "@supabase/supabase-js";
import type { AppEnv } from "../type/hono";

// Supabaseクライアント作成のヘルパー関数
export const createSupabaseClient = (env: AppEnv) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
};
