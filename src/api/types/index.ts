import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { cors } from "hono/cors";
import { POKEMON_URL } from "../../constants";
import { fetchTypePokemonAllList } from "../../lib/fetch";
import type { AppHono, AppVariables, AppEnv } from "../../type/hono";

const app: AppHono = new Hono<{ Variables: AppVariables; Bindings: AppEnv }>();
app.use("*", requestId());
app.use("*", cors());

app.get("/:id", async (c) => {
	const types = c.req.param("id");
	const getDataList = await fetchTypePokemonAllList(types);

	return new Response(
		JSON.stringify({
			length: getDataList.pokemon.length,
			pokemon: getDataList.pokemon,
		}),
		{
			headers: { "Content-Type": "application/json" },
			status: 200,
		},
	);
});

export default app;
