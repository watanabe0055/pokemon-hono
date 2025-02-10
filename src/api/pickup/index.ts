import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { fetchPokemon } from "../../lib/fetch";
import { ERROR_MESSAGE } from "../../constants/errorMessage";
import { getRandomNumbersForToday } from "../../lib/random";
import { createResponse } from "../../constants/response";
import { AppHono, AppVariables, AppEnv } from "../../type/hono";
import { GetPokemonDataPickUpType } from "../../type/pokemonAbility";
import { ConvertedPokemonDataType } from "../../type/convertPokemon";

const app: AppHono = new Hono<{ Variables: AppVariables; Bindings: AppEnv }>();

app.use("*", requestId());
app.use("*", cors());

/**
 * 本日の日付を元にランダムなポケモンのデータ（４つ）を返す
 */
app.get("/", async () => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式の日付
  const numbers = getRandomNumbersForToday(today);

  try {
    const pokemonList = await Promise.all(
      numbers.map((id) => fetchPokemon({ id: id.toString() }))
    ).then((list) =>
      list.filter((item): item is ConvertedPokemonDataType => item !== null)
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
    return createResponse("Internal Server Error", null, 500);
  }
});

export default app;
