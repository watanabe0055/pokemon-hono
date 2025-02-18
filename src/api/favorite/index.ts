import { Hono } from "hono";
import { fetchPokemon } from "../../lib/fetch";
import { ERROR_MESSAGE } from "../../constants/errorMessage";
import { requestId } from "hono/request-id";
import { cors } from "hono/cors";
import { createResponse } from "../../constants/response";
import type { AppEnv, AppHono, AppVariables } from "../../type/hono";
import type { ConvertedPokemonDataType } from "../../type/convertPokemon";
import { authMiddleware } from "../../middleware";
import { getUserFromToken } from "../../lib/user";
import { createSupabaseClient } from "../../lib/supabase";
import type { GetPokemonDataPickUpType } from "../../type/pokemonAbility";

const app: AppHono = new Hono<{ Variables: AppVariables; Bindings: AppEnv }>();

// ミドルウェアの設定
app.use("*", requestId());
app.use("*", cors());
app.use("*", authMiddleware);

// 型定義
type FavoriteType = {
  id: number;
  created_at: string;
  is_deleted: boolean;
  pokemon_id: number;
};

type UserFavoriteType = {
  favorite: FavoriteType;
};

type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

/**
 * お気に入り登録しているポケモンを返す
 */
app.get("/", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const user = await getUserFromToken(
      supabase,
      c.req.header("Authorization")
    );

    // Supabase のクエリを実行
    const { data, error } = (await supabase
      .from("user_favorite")
      .select("favorite(id, created_at, is_deleted, pokemon_id)")
      .eq("user_id", user.id)) as {
      data: UserFavoriteType[] | null;
      error: SupabaseError | null;
    };

    if (error) {
      console.error("Supabase error:", error);
      return createResponse("データベースエラーが発生しました", [], 500);
    }

    // 型アサーションを適用
    const favoriteList: UserFavoriteType[] = data ?? [];

    if (favoriteList.length === 0) {
      return createResponse<GetPokemonDataPickUpType[]>(
        "お気に入りが見つかりません",
        [],
        200 // 404ではなく200を返す（空の配列は正常なレスポース）
      );
    }

    const pokemonList = await Promise.all(
      favoriteList.map(async (item) => {
        try {
          return await fetchPokemon({
            id: item.favorite.pokemon_id.toString(),
          });
        } catch (err) {
          console.error(
            `ポケモンID ${item.favorite.pokemon_id} の取得に失敗:`,
            err
          );
          return null;
        }
      })
    ).then((items) =>
      items.filter((item): item is ConvertedPokemonDataType => item !== null)
    );

    return createResponse<ConvertedPokemonDataType[]>(
      ERROR_MESSAGE.SUCCESS,
      pokemonList,
      200
    );
  } catch (error) {
    console.error("Error in GET /favorite:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("認証")) {
      return createResponse(errorMessage, [], 401);
    }

    return createResponse("Internal Server Error", [], 500);
  }
});

/**
 * お気に入りにポケモンを追加
 */
app.post("/", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const user = await getUserFromToken(
      supabase,
      c.req.header("Authorization")
    );

    // リクエストボディの検証
    const body = await c.req.json().catch(() => {
      throw new Error("リクエストボディの解析に失敗しました");
    });

    // pokemonIdが直接指定されるように変更
    if (
      !body.pokemonId ||
      typeof body.pokemonId !== "number" ||
      body.pokemonId <= 0
    ) {
      throw new Error("有効なpokemonIdが指定されていません");
    }

    const pokemonId = body.pokemonId;

    // トランザクション的アプローチ（Supabaseではネイティブトランザクションが使えないため）
    // 1. favoriteテーブルから既存エントリを検索
    const { data: existingFavorite, error: selectError } = await supabase
      .from("favorite")
      .select("id")
      .eq("pokemon_id", pokemonId)
      .maybeSingle();

    if (selectError) {
      throw new Error(
        `favoriteの検索中にエラーが発生しました: ${selectError.message}`
      );
    }

    // 2. favoriteIdを取得（既存または新規作成）
    const favoriteId = await (async (): Promise<number> => {
      if (existingFavorite) {
        return existingFavorite.id;
      }

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
        throw new Error(
          `favoriteの作成に失敗しました: ${
            createError?.message || "不明なエラー"
          }`
        );
      }

      return newFavorite.id;
    })();

    // 既存のuser_favorite関連付けをチェック
    const { data: existingUserFavorite, error: checkError } = await supabase
      .from("user_favorite")
      .select("id")
      .eq("user_id", user.id)
      .eq("favorite_id", favoriteId)
      .maybeSingle();

    if (checkError) {
      throw new Error(
        `既存のuser_favoriteチェック中にエラーが発生しました: ${checkError.message}`
      );
    }

    if (existingUserFavorite) {
      return c.json(
        {
          message: "既にお気に入りに登録されています",
          user_id: user.id,
          favorite_id: favoriteId,
          pokemon_id: pokemonId,
        },
        200
      );
    }

    // 3. user_favoriteテーブルに関連付けを登録
    const { error: insertError } = await supabase.from("user_favorite").insert({
      user_id: user.id,
      favorite_id: favoriteId,
    });

    if (insertError) {
      throw new Error(
        `user_favoriteの登録に失敗しました: ${insertError.message}`
      );
    }

    // 4. 成功レスポンスを返す
    return c.json(
      {
        message: "お気に入りを登録しました",
        user_id: user.id,
        favorite_id: favoriteId,
        pokemon_id: pokemonId,
      },
      201
    ); // 201 Created
  } catch (error) {
    console.error("Error in POST /favorite:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("認証")) {
      return c.json({ error: errorMessage }, 401);
    }

    if (
      errorMessage.includes("有効な") ||
      errorMessage.includes("指定されていません")
    ) {
      return c.json({ error: errorMessage }, 400);
    }

    if (errorMessage.includes("既に")) {
      return c.json({ message: errorMessage }, 200);
    }

    return c.json(
      { error: "サーバーエラーが発生しました", details: errorMessage },
      500
    );
  }
});

/**
 * お気に入りから削除するエンドポイント（新規追加）
 */
app.delete("/:id", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const user = await getUserFromToken(
      supabase,
      c.req.header("Authorization")
    );

    const pokemonId = Number.parseInt(c.req.param("id"), 10);
    if (Number.isNaN(pokemonId) || pokemonId <= 0) {
      throw new Error("有効なPokemon IDが指定されていません");
    }

    // 1. favoriteテーブルからpokemon_idに一致するレコードを検索
    const { data: favorite, error: favoriteError } = await supabase
      .from("favorite")
      .select("id")
      .eq("pokemon_id", pokemonId)
      .maybeSingle();

    if (favoriteError) {
      throw new Error(
        `favoriteの検索中にエラーが発生しました: ${favoriteError.message}`
      );
    }

    if (!favorite) {
      return c.json(
        { message: "指定されたポケモンはお気に入りに登録されていません" },
        404
      );
    }

    // 2. user_favoriteから該当するレコードを削除
    const { error: deleteError } = await supabase
      .from("user_favorite")
      .delete()
      .eq("user_id", user.id)
      .eq("favorite_id", favorite.id);

    if (deleteError) {
      throw new Error(
        `お気に入りの削除中にエラーが発生しました: ${deleteError.message}`
      );
    }

    return c.json(
      {
        message: "お気に入りから削除しました",
        pokemon_id: pokemonId,
      },
      200
    );
  } catch (error) {
    console.error("Error in DELETE /favorite/:id:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("認証")) {
      return c.json({ error: errorMessage }, 401);
    }
    if (
      errorMessage.includes("有効な") ||
      errorMessage.includes("指定されていません")
    ) {
      return c.json({ error: errorMessage }, 400);
    }

    return c.json(
      { error: "サーバーエラーが発生しました", details: errorMessage },
      500
    );
  }
});

export default app;
