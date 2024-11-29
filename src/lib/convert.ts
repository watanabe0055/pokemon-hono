import { PokemonDataType } from "../type/convertPokemon";

/**
 * 数が多いので必要なデータだけを選択して返す
 * @param 取得しただけのデータ
 * @returns　特定の要素だけのデータ
 */
export const convertPokemonData = (data: PokemonDataType) => {
  console.log(data.stats);
  return {
    id: data.id,
    sprites: data.sprites,
    stats: data.stats,
    types: data.types,
  };
};
