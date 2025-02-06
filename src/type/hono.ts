import { Hono } from "hono";

export type AppVariables = {
  user: {
    id: string;
    email: string;
  };
};

export type AppEnv = {
  // 環境変数や依存関係をここに定義
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

// アプリケーション全体で使用する基本的なHono型
export type AppHono = Hono<{
  Variables: AppVariables;
  Bindings: AppEnv;
}>;
