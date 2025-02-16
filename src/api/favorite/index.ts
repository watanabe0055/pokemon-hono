import { Hono } from "hono";
import { fetchAllPokemon, fetchPokemon } from "../../lib/fetch";
import { ERROR_MESSAGE } from "../../constants/errorMessage";
import { requestId } from "hono/request-id";
import { cors } from "hono/cors";
import { createResponse } from "../../constants/response";
import type { AppEnv, AppHono, AppVariables } from "../../type/hono";
import type { ConvertedPokemonDataType } from "../../type/convertPokemon";
import { authMiddleware } from "../../middleware";
import { createClient } from "@supabase/supabase-js";
import { GetPokemonDataPickUpType } from "../../type/pokemonAbility";

const app: AppHono = new Hono<{ Variables: AppVariables; Bindings: AppEnv }>();

app.use("*", requestId());
app.use("*", cors());
app.use("*", authMiddleware);

type FavoriteType = {
  id: number;
  created_at: string;
  is_deleted: boolean;
  pokemon_id: number;
};

type UserFavoriteType = {
  favorite: FavoriteType;
};

/**
 * お気に入り登録しているポケモンを返す
 */
app.get("/", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  // Supabase のクエリを実行
  const { data, error } = (await supabase
    .from("user_favorite")
    .select("favorite(id, created_at, is_deleted, pokemon_id)")
    .eq("user_id", user?.id)) as {
    data: UserFavoriteType[] | null;
    error: any;
  };

  if (error) {
    console.error("Supabase error:", error);
    return c.json({ error: error.message }, 500);
  }

  // 型アサーションを適用
  const favoriteList: UserFavoriteType[] = data ?? [];

  try {
    const pokemonList = await Promise.all(
      favoriteList.map((item) =>
        fetchPokemon({ id: item.favorite.pokemon_id.toString() })
      )
    ).then((item) =>
      item.filter((item): item is ConvertedPokemonDataType => item !== null)
    );
    if (pokemonList.length === 0) {
      return createResponse<GetPokemonDataPickUpType[]>(
        ERROR_MESSAGE.NOT_FOUND,
        [],
        400
      );
    }

    return createResponse<ConvertedPokemonDataType[]>(
      ERROR_MESSAGE.SUCCESS,
      pokemonList,
      200
    );
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    return createResponse("Internal Server Error", [], 500);
  }
});

// ポケモン詳細取得（動的パス）
app.post("/", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  // Supabase のクエリを実行
  // const { data, error } = (await supabase
  //   .from("user_favorite")
  //   .insert("favorite(id, created_at, is_deleted, pokemon_id)")
  //   .eq("user_id", user?.id)) as {
  //   data: UserFavoriteType[] | null;
  //   error: any;
  // };
  return c.text("aaa");
});

export default app;
