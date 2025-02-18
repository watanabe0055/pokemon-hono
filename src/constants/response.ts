const JSON_HEADERS = { "Content-Type": "application/json" };

export const createResponse = <T>(
  message: string,
  pokemonData: T | null,
  status: number
) => {
  return new Response(JSON.stringify({ message, pokemonData }), {
    headers: JSON_HEADERS,
    status,
  });
};
