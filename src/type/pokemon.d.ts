declare type ProcessedPokemon = {
  id: string;
  name: string | undefined;
  image: string | undefined;
};

declare type ProcessedPokemonList = ProcessedPokemon[];

declare type ListPageItem = {
  processedPokemonList: ProcessedPokemonList;
  nextUrl: string;
};

declare type ability = {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
};

declare type DetailPokemon = {
  id: string;
  name?: string;
  genera?: string;
  image?: string;
  types?: string[];
  abilities: Array<ability> | [];
};

declare type PokemonOutline = {
  name: string;
  url: string;
};
declare type PokemonList = PokemonOutline[];

declare type Pokemon = {
  sprites: { other: { "official-artwork": { front_default: string } } };
  abilities: { ability: { url: string } }[];
  types: { type: { url: string } }[];
};

declare type PokemonListData = {
  next: string;
  results: PokemonList;
};

declare type languageNameObject = {
  name: string;
  language: { name: string };
};
declare type Ability = languageNameObject[];
declare type Type = languageNameObject[];
declare type Names = languageNameObject[];

declare type languageGenusObject = {
  genus: string;
  language: { name: string };
};
declare type Genera = languageGenusObject[];

declare type FetchType = { data: { names: languageNameObject[] } };
declare type FetchAbilities = FetchType;

declare type PokemonSpecies = {
  names: Names;
  genera: Genera;
};
