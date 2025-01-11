import { PokemonDataType, SpritesType } from "../type/convertPokemon";
import { AbilityResponseType } from "../type/pokemonAbility";
import { SpeciesListType } from "../type/pokemonSpecoes";
import { fetchAbility } from "./fetch";

/**
 * 数が多いので必要なデータだけを選択して返す
 * @param 取得しただけのデータ
 * @returns　特定の要素だけのデータ
 */
export const convertPokemonData = (
  data: PokemonDataType,
  names: SpeciesListType,
  ability?: AbilityResponseType
) => {
  const convertedData = convertKeys(data);

  return {
    id: data.id,
    names: names,
    sprites: convertedData.sprites,
    stats: data.stats,
    types: data.types,
    abilities: { abilities: data.abilities, names: ability?.names },
  };
};

type TransformKey<T> = {
  [K in keyof T as K extends string
    ? K extends `${infer Start}-${infer End}`
      ? `${Start}_${End}`
      : K
    : K]: T[K] extends Record<string, unknown> ? TransformKey<T[K]> : T[K];
};

/**
 * 一部スネークケースになってなかったので、スネークケースに変換
 */
function convertKeys<T extends Record<string, unknown>>(
  data: T
): TransformKey<T> {
  const result: any = {};

  for (const key in data) {
    const newKey = key.replace(/-/g, "_"); // ハイフンをアンダースコアに変換
    const value = data[key];
    result[newKey] =
      value && typeof value === "object" ? convertKeys(value) : value;
  }

  return result;
}
