const JSON_HEADERS = { "Content-Type": "application/json" };

export const createResponse = <T>(
  message: string,
  data: T | null,
  status: number
) => {
  return new Response(JSON.stringify({ message, data }), {
    headers: JSON_HEADERS,
    status,
  });
};
