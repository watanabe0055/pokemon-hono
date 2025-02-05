const JSON_HEADERS = { "Content-Type": "application/json" };

export const createResponse = (message: string, data: any, status: number) => {
  return new Response(JSON.stringify({ message, pokemonData: data }), {
    headers: JSON_HEADERS,
    status,
  });
};
