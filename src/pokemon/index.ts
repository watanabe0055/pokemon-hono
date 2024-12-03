import { Hono } from "hono";
import { replacePokemonUrlParams } from "../lib/url";

import { fetchAllPokemon, fetchPokemon } from "../lib/fetch";
import { ERROR_MESSAGE } from "../constants/errorMessage";

const app = new Hono();

app.get("/", async (c) => {
  const q = c.req.query();
  const selectionQuery = replacePokemonUrlParams(q);

  // const pokemonIndex = await fetchAllPokemon();
  // console.log("Fetched Pokemon data:", pokemonIndex);

  // データを取得
  const getPokemonData = selectionQuery.id
    ? await fetchPokemon({ id: selectionQuery.id }).catch((error) => {
        console.error("Error fetching Pokemon data:", error);
        return null; // エラー時には null を返す
      })
    : null;

  // データが null の場合は 400 を返す
  // if (!selectionQuery.id) {
  //   return new Response(
  //     JSON.stringify({
  //       message: ERROR_MESSAGE.NOT_FOUND,
  //       pokemonData: pokemonIndex,
  //     }),
  //     {
  //       headers: { "Content-Type": "application/json" },
  //       status: 400,
  //     }
  //   );
  // }

  // データが null の場合は 400 を返す
  if (!getPokemonData) {
    return new Response(
      JSON.stringify({
        message: ERROR_MESSAGE.NOT_FOUND,
        id: selectionQuery.id,
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
      id: selectionQuery.id,
      pokemonData: getPokemonData,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
});

export default app;
