import { Hono } from "hono";
import { testClient } from "hono/testing";
import { expect, it, describe } from "vitest";
import pickup from "../../../api/pickup";

describe("Pickup API", () => {
  it("should return 4 random Pokemon", async () => {
    const app = new Hono().route("/pickup", pickup);
    const res = await testClient(app).pickup.$get();

    // レスポンスのステータスコードを確認
    expect(res.status).toBe(200);

    // // レスポンスボディを確認
    const data = await res.json();
    console.log(data);

    // // ポケモンリストの長さが4であることを確認
    expect(data.data).toHaveLength(4);

    // // 各ポケモンデータの基本的な構造を確認
    data.data.forEach((pokemon) => {
      expect(pokemon).toHaveProperty("id");
      expect(pokemon).toHaveProperty("names");
      expect(pokemon).toHaveProperty("sprites");
      expect(pokemon).toHaveProperty("stats");
      // 他の必要なプロパティも追加してください
    });
  });

  it("should handle errors gracefully", async () => {
    // エラーケースのテストを追加することもできます
    // 例: フェッチに失敗した場合など
  });
});
