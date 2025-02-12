import { expect, it, describe, vi } from "vitest";
import app from "../..";
import { ConvertedPokemonDataType } from "../../type/convertPokemon";

type GetData = {
  data: Array<ConvertedPokemonDataType>;
  message: string;
};

describe("Pokemon List API - 正常系", async () => {
  const res = await app.request("http://localhost/v1/pokemon");
  const data = (await res.json()) as GetData;

  it("レスポンスステータスが200であること", async () => {
    expect(res.status).toBe(200);
  });

  it("ポケモンデータが20件取得できること", async () => {
    expect(data.data).toHaveLength(20);
  });

  it("各ポケモンデータの基本的な構造を確認", async () => {
    data.data.forEach((pokemon) => {
      expect(pokemon).toHaveProperty("id");
      expect(pokemon).toHaveProperty("names");
      expect(pokemon).toHaveProperty("sprites");
      expect(pokemon).toHaveProperty("stats");
      expect(pokemon).toHaveProperty("types");
      expect(pokemon).toHaveProperty("abilities");
    });
  });

  it("offsetパラメータが正しく機能すること", async () => {
    const resWithOffset = await app.request(
      "http://localhost/v1/pokemon?offset=31"
    );
    const dataWithOffset = (await resWithOffset.json()) as GetData;

    expect(resWithOffset.status).toBe(200);
    expect(dataWithOffset.data[0].id).toBe(31);
  });
});

describe("Pokemon List API - 異常系", async () => {
  it("無効なoffset（最大値超過）でリクエストした場合、400エラーが返ること", async () => {
    const res = await app.request("http://localhost/v1/pokemon?offset=1026");
    const data = (await res.json()) as GetData;

    expect(res.status).toBe(400);
    expect(data.message).toBe("Offset exceeds the maximum limit.");
  });

  it("APIエラー時に500エラーが返ること", async () => {
    // fetchのモック
    vi.spyOn(global, "fetch").mockImplementation(() => {
      throw new Error("Mocked fetch error");
    });

    const res = await app.request("http://localhost/v1/pokemon");
    const data = (await res.json()) as GetData;

    expect(res.status).toBe(500);
    expect(data.message).toBe("Internal Server Error");
    expect(data.data).toBeNull();

    // モックを元に戻す
    vi.restoreAllMocks();
  });

  it("ポケモンデータが見つからない場合、400エラーが返ること", async () => {
    // fetchのモック
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(null))
    );

    const res = await app.request("http://localhost/v1/pokemon");
    const data = (await res.json()) as GetData;

    expect(res.status).toBe(500);
    expect(data.message).toBe("Internal Server Error");
    expect(data.data).toBeNull();

    // モックを元に戻す
    vi.restoreAllMocks();
  });
});
