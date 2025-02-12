import { expect, it, describe, vi } from "vitest";
import app from "../../..";
import { GetPokemonDataPickUpType } from "../../../type/pokemonAbility";

type GetData = {
	data: Array<GetPokemonDataPickUpType>;
	message: string;
};

describe("Pickup API 200", async () => {
	const res = await app.request("http://localhost/v1/pickup");
	// レスポンスボディを確認
	const data = (await res.json()) as GetData;

	it("レスポンスステータスが200であること", async () => {
		// レスポンスのステータスコードを確認
		expect(res.status).toBe(200);
	});

	it("ピックアップポケモンが４種類いること", async () => {
		// ポケモンリストの長さが4であることを確認
		expect(data.data).toHaveLength(4);
	});
	it("各ポケモンデータの基本的な構造を確認", async () => {
		// 各ポケモンデータの基本的な構造を確認
		for (const pokemon of data.data) {
			expect(pokemon).toHaveProperty("id");
			expect(pokemon).toHaveProperty("name");
			expect(pokemon).toHaveProperty("sprites");
			expect(pokemon).toHaveProperty("types");
			expect(pokemon).toHaveProperty("stats");
			expect(pokemon).toHaveProperty("abilities");
		}
	});
});

describe("Pickup API 500", async () => {
	vi.spyOn(global, "fetch").mockImplementation(() => {
		throw new Error("Mocked fetch error");
	});

	const res = await app.request("http://localhost/v1/pickup");

	it("500エラーが返ってくること", async () => {
		// ステータスコード 500 を期待
		expect(res.status).toBe(500);
	});

	it("500エラーが返ってくること", async () => {
		const data = (await res.json()) as GetData;

		// dataの配列が0であること
		expect(data.data.length).equal(0);

		expect(data.data.length).not.null;

		// エラーメッセージが適切であることを確認
		expect(data.message).toBe("Internal Server Error");

		// モックを元に戻す
		vi.restoreAllMocks();
	});
});
