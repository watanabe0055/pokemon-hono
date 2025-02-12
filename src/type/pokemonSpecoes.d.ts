export type SpeciesType = {
	language: {
		name: string;
		url: string;
	};
};
export type SpeciesListType = Array<SpeciesType>;

export type PokemonSpecies = {
	name: string;
	id: number;
	is_baby: boolean;
	is_legendary: boolean;
	is_mythical: boolean;
	names: SpeciesListType;
};
