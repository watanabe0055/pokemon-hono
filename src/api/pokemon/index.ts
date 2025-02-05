import { Hono } from "hono";
import { fetchAllPokemon, fetchPokemon } from "../../lib/fetch";
import { ERROR_MESSAGE } from "../../constants/errorMessage";
import { requestId } from "hono/request-id";
import { cors } from "hono/cors";
import { JSON_HEADERS } from "../../constants";

const app = new Hono();

// 定数の定義
const MAX_OFFSET = 1025;

// レスポンスの共通処理
const createResponse = (message: string, data: any, status: number) => {
  return new Response(JSON.stringify({ message, pokemonData: data }), {
    headers: JSON_HEADERS,
    status,
  });
};

app.use("*", requestId());
app.use("*", cors());

// ポケモン一覧取得
app.get("/", async (c) => {
  const offset = Number(c.req.query("offset")) || 1;

  // 最大値を超えた場合の処理
  if (offset > MAX_OFFSET - 29) {
    return createResponse("Offset exceeds the maximum limit.", null, 400);
  }

  try {
    const pokemonList = await fetchAllPokemon(offset);

    if (!pokemonList) {
      return createResponse(ERROR_MESSAGE.NOT_FOUND, pokemonList, 400);
    }

    return createResponse(ERROR_MESSAGE.SUCCESS, pokemonList, 200);
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    return createResponse("Internal Server Error", null, 500);
  }
});

// ポケモン詳細取得（動的パス）
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const getPokemonData = id
    ? await fetchPokemon({ id }).catch(() => null)
    : null;

  if (!getPokemonData) {
    return createResponse(ERROR_MESSAGE.POKEMON_NOT_AVAILABLE, undefined, 200);
  }

  return createResponse(ERROR_MESSAGE.SUCCESS, getPokemonData, 200);
});

export default app;
