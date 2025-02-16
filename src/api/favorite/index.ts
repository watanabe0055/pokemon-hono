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
// app.use("*", authMiddleware);

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

  if (!user || !user.id) {
    return c.json(
      { error: "認証されていないか、ユーザーIDが取得できません" },
      401
    );
  }

  const body = await c.req.json();
  const pokemonId = body.pokemon[0]; // pokemon配列から最初のID取得

  if (!pokemonId) {
    return c.json({ error: "Pokemon IDが指定されていません" }, 400);
  }

  // 1. favoriteテーブルから既存エントリを検索
  const { data: existingFavorite, error: selectError } = await supabase
    .from("favorite")
    .select("id")
    .eq("pokemon_id", pokemonId)
    .maybeSingle();

  if (selectError) {
    return c.json(
      { error: "favoriteの検索中にエラーが発生しました", details: selectError },
      500
    );
  }

  // 2. favoriteIdを取得（既存または新規作成）
  let favoriteId;

  if (existingFavorite) {
    favoriteId = existingFavorite.id;
    console.log("既存のfavoriteを使用:", favoriteId);
  } else {
    const { data: newFavorite, error: createError } = await supabase
      .from("favorite")
      .insert({
        pokemon_id: pokemonId,
        created_at: new Date().toISOString(),
        is_deleted: false,
      })
      .select("id")
      .single();

    if (createError || !newFavorite) {
      return c.json(
        {
          error: "favoriteの作成に失敗しました",
          details: createError,
        },
        500
      );
    }

    favoriteId = newFavorite.id;
    console.log("新しいfavoriteを作成:", favoriteId);
  }

  if (typeof favoriteId !== "number") {
    return c.json(
      {
        error: "無効なfavorite_id",
        details: {
          actual_type: typeof favoriteId,
          value: favoriteId,
        },
      },
      500
    );
  }

  // 3. user_favoriteテーブルに関連付けを登録
  const { error: insertError } = await supabase.from("user_favorite").insert({
    user_id: user.id,
    favorite_id: favoriteId,
  });

  if (insertError) {
    return c.json(
      {
        error: "user_favoriteの登録に失敗しました",
        details: insertError,
        debug: {
          user_id: user.id,
          user_id_type: typeof user.id,
          favorite_id: favoriteId,
          favorite_id_type: typeof favoriteId,
        },
      },
      500
    );
  }

  // 4. 成功レスポンスを返す
  return c.json({
    message: "お気に入りを登録しました",
    user_id: user.id,
    favorite_id: favoriteId,
    pokemon_id: pokemonId,
  });
});

export default app;
