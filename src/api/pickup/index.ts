import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { fetchPokemon } from "../../lib/fetch";
import { ERROR_MESSAGE } from "../../constants/errorMessage";
import { getRandomNumbersForToday } from "../../lib/random";

const app = new Hono();
app.use("*", requestId());
app.use("*", cors());

/**
 * 本日の日付を元にランダムなポケモンのデータ（４つ）を返す
 */
app.get("/", async () => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式の日付
  const numbers = getRandomNumbersForToday(today);

  const pokemonList = await Promise.all(
    numbers.map((id) => fetchPokemon({ id: id.toString() }))
  );

  // データがnullの時は400を返す
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

export default app;
