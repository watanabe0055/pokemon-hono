import { Hono } from "hono";
import { replacePokemonUrlParams } from "../lib/url";

import { fetchAllPokemon, fetchPokemon } from "../lib/fetch";
import { ERROR_MESSAGE } from "../constants/errorMessage";
import { requestId } from "hono/request-id";

const app = new Hono();
app.use("*", requestId());

app.get("/", async (c) => {
  const pokemonList = await fetchAllPokemon(30);

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

  // データが null の場合は 400 を返す
  if (!getPokemonData) {
    return new Response(
      JSON.stringify({
        message: ERROR_MESSAGE.NOT_FOUND,
        id,
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
