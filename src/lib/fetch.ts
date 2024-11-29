import { POKEMON_URL } from "../constants";
import { pokemonID } from "../type";

type fetchPokemonType = {
  id: pokemonID;
};

export const fetchPokemon = async ({ id }: fetchPokemonType) => {
  try {
    const replaceFetchUrl = `${POKEMON_URL}${id}`;
    const result = await fetch(replaceFetchUrl);

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    // レスポンスをJSONとしてパース
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    throw error;
  }
};
