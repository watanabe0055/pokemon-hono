import {
  ConvertedPokemonDataType,
  PokemonDataType,
} from "../type/convertPokemon";
import { AbilityResponseType } from "../type/pokemonAbility";
import { SpeciesListType } from "../type/pokemonSpecoes";

/**
 * 数が多いので必要なデータだけを選択して返す
 * @param 取得しただけのデータ
 * @returns　特定の要素だけのデータ
 */
export const convertPokemonData = (
  data: PokemonDataType,
  names: SpeciesListType,
  abilities?: Array<AbilityResponseType>
): ConvertedPokemonDataType => {
  const convertedData = convertKeys(data);
  const convertedAbilityList = abilities
    ? convertAbilityTextList(abilities)
    : [];

  return {
    id: data.id,
    names: names,
    sprites: convertedData.sprites,
    stats: data.stats,
    types: data.types,
    abilities: convertedAbilityList,
  };
};

const convertAbilityTextList = (abilities: Array<AbilityResponseType>) => {
  const extractJapaneseEntry = <T extends { language: { name: string } }>(
    entries: T[]
  ) => entries.find((entry) => entry.language.name === "ja");

  const combinedList = abilities.map((ability) => {
    const jaName = extractJapaneseEntry(ability.names);
    const jaText = extractJapaneseEntry(ability.flavor_text_entries);

    if (jaName && jaText) {
      return {
        name: jaName.name,
        flavor_text: jaText.flavor_text,
        language: jaText.language,
        version_group: jaText.version_group,
      };
    }

    return null;
  });

  // null を除外して返す
  return combinedList.filter((entry) => entry !== null);
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
