type EffectChangesType = [];

type LanguageType = {
  name: string;
  url: string;
};

type EffectEntryType = {
  effect: string;
  language: LanguageType;
  short_effect: string;
};

/**
 * @todo これ使う
 */
type EffectEntries = Array<EffectEntryType>;

type versionGroupType = {
  name: string;
  url: string;
};
type flavorTextEntryType = {
  flavor_text: string;
  language: LanguageType;
  version_group: versionGroupType;
};

/**
 * @todo これ使う
 */
type flavorTextEntriesType = Array<flavorTextEntryType>;

/**
 * @todo これ使う
 */
type generationType = { name: string; url: string };

/**
 * @todo これ使う
 */
type isMainSeries = boolean;

type nameType = {
  language: LanguageType;
  name: string;
};

type namesType = Array<nameType>;

type pokemonType = {
  is_hidden: boolean;
  pokemon: versionGroupType;
  slot: number;
};

type pokemonListType = Array<pokemonType>;

export type AbilityResponseType = {
  effect_changes: EffectChangesType;
  effect_entries: EffectEntries;
  flavor_text_entries: flavorTextEntriesType;
  generation: generationType;
  id: string;
  name: string;
  names: namesType;
  pokemon: pokemonListType;
};

/**
 * honoAPIでコンバートしてアビリティーの一部だけを返してるプロパティ
 */

export type AbilityHonoResponseType = Pick<
  flavorTextEntryType,
  "flavor_text" | "language" | "version_group"
> &
  Pick<AbilityResponseType, "name">;

export type AbilityListHonoResponseType = {
  abilities: Array<AbilityHonoResponseType>;
};

/**
 * コンバートして必要なところだけ抽出した型定義
 */
export type ConvertPokemonDataType = {
  id: number;
  names: PokemonSpecies;
  sprites: SpritesType;
  stats: StatsType;
  types: Types;
};

export type GetPokemonDataPickUpType = {
  message: ResponseMessage;
  pokemonData: Array<ConvertPokemonDataType & AbilityListHonoResponseType> | [];
};
