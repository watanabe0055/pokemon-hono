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
