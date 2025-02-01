import { POKEMON_URL } from "../constants";
import { pokemonID } from "../type";
import { PokemonDataType } from "../type/convertPokemon";
import { AbilityResponseType } from "../type/pokemonAbility";
import { PokemonSpecies } from "../type/pokemonSpecoes";
import { convertPokemonData } from "./convert";

type fetchPokemonType = {
  id: pokemonID;
};

/**
 * id指定したポケモンだけを返す
 * @param param0
 * @returns
 */
export const fetchPokemon = async ({ id }: fetchPokemonType) => {
  try {
    const replaceFetchUrl = `${POKEMON_URL.DATA}${id}`;

    // `replaceFetchUrl` のデータを取得
    const pokemonResponse = await fetch(replaceFetchUrl);

    // レスポンスのエラーチェック
    if (!pokemonResponse.ok) {
      throw new Error(`HTTP error! status: ${pokemonResponse.status}`);
    }

    // JSONデータをパース
    const pokemonData: PokemonDataType = await pokemonResponse.json();

    const MAX_POKEMON_ID = 1025;
    // pokemonData.idが1026以上の場合は何も返さない
    if (pokemonData.id > MAX_POKEMON_ID) {
      return null; // 必要に応じて、他の形式でデータを返すことも可能
    }

    const fetchSpeciesUrl = `${POKEMON_URL.SPECIES}${id}`;
    const speciesResponse = await fetch(fetchSpeciesUrl);

    // レスポンスのエラーチェック
    if (!speciesResponse.ok) {
      throw new Error(`HTTP error! status: ${speciesResponse.status}`);
    }

    const pokemonSpeciesData: PokemonSpecies = await speciesResponse.json();

    const getAbility =
      pokemonData.abilities.length > 0
        ? await fetchAbility(pokemonData.abilities)
        : undefined;

    // 必要なデータを取り出して convertPokemonData に渡す
    const { names } = pokemonSpeciesData;

    const convertedPokemonData = convertPokemonData(
      pokemonData,
      names,
      getAbility
    );

    return convertedPokemonData;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    throw error;
  }
};

/**
 * ポケモンを特定のoffsetから30件分取得し返す
 * @param offset
 */
export const fetchAllPokemon = async (offset: number) => {
  const MAX_LIMIT = 30;

  try {
    // 並列リクエストを実行
    const promises = Array.from({ length: MAX_LIMIT }, (_, index) => {
      const id = offset + index;
      const replaceFetchUrl = `${POKEMON_URL.DATA}${id}`;
      const fetchSpeciesUrl = `${POKEMON_URL.SPECIES}${id}`;

      // 並列で個別のポケモンデータと種データを取得
      return Promise.all([
        fetch(replaceFetchUrl).then(async (res) => {
          if (!res.ok) throw new Error(`Failed to fetch: ${replaceFetchUrl}`);
          // 型アサーションを追加
          return (await res.json()) as PokemonDataType;
        }),
        fetch(fetchSpeciesUrl).then(async (res) => {
          if (!res.ok) throw new Error(`Failed to fetch: ${fetchSpeciesUrl}`);
          // 型アサーションを追加
          return (await res.json()) as PokemonSpecies;
        }),
      ]).then(([pokemonData, pokemonSpeciesData]) => {
        // namesを取り出し、convertPokemonDataを実行
        const { names } = pokemonSpeciesData;
        return convertPokemonData(pokemonData, names);
      });
    });

    // 全てのリクエストを並列で処理
    const results = await Promise.all(promises);

    // console.log("Fetched and converted Pokemon data:", results);

    return results; // 加工されたデータの配列を返す
  } catch (error) {
    console.error("Error fetching all Pokemon data:", error);
    throw error; // 必要に応じてエラーを再スロー
  }
};

type typePokemonList = {
  pokemon: [
    pokemon: {
      pokemon: {
        name: string;
        url: string;
      };
      slot: number;
    }
  ];
};
export const fetchTypePokemonAllList = async (type: string) => {
  const request = `${POKEMON_URL.TYPE}${type}`;
  try {
    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as typePokemonList;

    return data;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    throw error;
  }
};

export const fetchAbility = async (
  abilities: PokemonDataType["abilities"]
): Promise<Array<AbilityResponseType>> => {
  try {
    const promises = abilities?.map((ability) => {
      const fetchAbilityUrl = ability.ability.url;
      return fetch(fetchAbilityUrl).then(async (res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${fetchAbilityUrl}`);

        return (await res.json()) as AbilityResponseType;
      });
    });

    const results = await Promise.all(promises);

    return results;
  } catch (error) {
    console.error("Error fetching all Pokemon data:", error);
    throw error; // 必要に応じてエラーを再スロー
  }
};
