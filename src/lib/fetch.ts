import { POKEMON_URL } from "../constants";
import { pokemonID } from "../type";
import { PokemonDataType } from "../type/convertPokemon";
import { PokemonSpecies } from "../type/pokemonSpecoes";
import { convertPokemonData } from "./convert";

type fetchPokemonType = {
  id: pokemonID;
};

export const fetchPokemon = async ({ id }: fetchPokemonType) => {
  try {
    const replaceFetchUrl = `${POKEMON_URL.DATA}${id}`;
    const result = await fetch(replaceFetchUrl);

    const fetchSpeciesUrl = `${POKEMON_URL.SPECIES}${id}`;
    const speciesResult = await fetch(fetchSpeciesUrl);
    const pokemonSpeciesData: PokemonSpecies = await speciesResult.json();
    const { names } = pokemonSpeciesData;

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    // レスポンスをJSONとしてパース
    const data: PokemonDataType = await result.json();
    const convertedPokemonData = convertPokemonData(data, names);

    return convertedPokemonData;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    throw error;
  }
};

// const fetchWithRetry = async (
//   url: string,
//   retries: number = 3
// ): Promise<any> => {
//   for (let attempt = 0; attempt < retries; attempt++) {
//     try {
//       const res = await fetch(url);
//       if (!res.ok) {
//         throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
//       }
//       return await res.json();
//     } catch (error) {
//       console.error(`Attempt ${attempt + 1} failed:`, error);
//       if (attempt === retries - 1) throw error; // 最後の試行でも失敗した場合はエラーをスロー
//     }
//   }
// };

// const fetchBatch = async (ids: number[]): Promise<any[]> => {
//   const requests = ids.map((id) => fetchWithRetry(`${POKEMON_URL}${id}`));
//   return Promise.allSettled(requests).then((results) =>
//     results
//       .filter((result) => result.status === "fulfilled")
//       .map((result) => (result as PromiseFulfilledResult<any>).value)
//   );
// };

// export const fetchAllPokemon = async (): Promise<any[]> => {
//   try {
//     const batchSize = 10; // 一度に処理するバッチサイズ
//     const max = 1026;
//     const pokemonIds = Array.from({ length: 11 }, (_, i) => i + 1);
//     const batches = [];

//     for (let i = 0; i < pokemonIds.length; i += batchSize) {
//       const batchIds = pokemonIds.slice(i, i + batchSize);
//       batches.push(fetchBatch(batchIds));
//     }

//     const allPokemonData = (await Promise.all(batches)).flat();
//     const convertedPokemonData = allPokemonData.map((data) =>
//       convertPokemonData(data)
//     );

//     return convertedPokemonData;
//   } catch (error) {
//     console.error("Failed to fetch all Pokemon data:", error);
//     throw error;
//   }
// };
