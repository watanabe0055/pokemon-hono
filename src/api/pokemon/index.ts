import { Hono } from "hono";
import { replacePokemonUrlParams } from "../../lib/url";

import { fetchAllPokemon, fetchPokemon } from "../../lib/fetch";
import { ERROR_MESSAGE } from "../../constants/errorMessage";
import { requestId } from "hono/request-id";
import { cors } from "hono/cors";

const app = new Hono();
app.use("*", requestId());
app.use("*", cors());

app.get("/", async (c) => {
  const offset = Number(c.req.query("offset")) || 1;

  // 最大値 1025 を超える場合は何も返さない
  const MAX_OFFSET = 1025;
  if (offset > MAX_OFFSET - 29) {
    return new Response(
      JSON.stringify({
        message: "Offset exceeds the maximum limit.",
        pokemonData: null,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  try {
    const pokemonList = await fetchAllPokemon(offset);

    // データが null の場合は 400 を返す
    if (!pokemonList) {
      return new Response(
        JSON.stringify({
          message: ERROR_MESSAGE.NOT_FOUND,
          pokemonData: pokemonList,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: ERROR_MESSAGE.SUCCESS,
        pokemonData: pokemonList,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);

    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// 動的パス定義
app.get("/:id", async (c) => {
  const id = c.req.param("id"); // URL の ":id" 部分を取得

  // データを取得
  const getPokemonData = id
    ? await fetchPokemon({ id }).catch((error) => {
        console.error("Error fetching Pokemon data:", error);
        return null; // エラー時には null を返す
      })
    : null;

  // データが null の場合は 200 を返す
  if (!getPokemonData) {
    return new Response(
      JSON.stringify({
        message: ERROR_MESSAGE.POKEMON_NOT_AVAILABLE,
        id,
        pokemonData: undefined,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  }

  return new Response(
    JSON.stringify({
      message: ERROR_MESSAGE.SUCCESS,
      id,
      pokemonData: getPokemonData,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
});

export default app;
