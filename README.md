## API エンドポイント

### ポケモン一覧取得

- **GET** `/v1/pokemon?offset=<number>`

  指定したオフセットからポケモンの一覧を取得します。最大オフセットは 1025 です。

### ポケモン詳細取得

- **GET** `/v1/pokemon/:id`

  指定した ID のポケモンの詳細を取得します。

### ランダムポケモン取得

- **GET** `/v1/pickup`

  本日の日付を基にランダムな 4 つのポケモンのデータを取得します。

### タイプ別ポケモン取得

- **GET** `/v1/pokemon-type/:id`

  指定したタイプのポケモン一覧を取得します。

### 認証

- **GET** `/v1/auth/public`

  認証不要の公開エンドポイント。

- **GET** `/v1/auth/private/profile`

  認証が必要なプライベートエンドポイント。Bearer トークンを使用して認証します。

## 環境変数

- `SUPABASE_URL`: Supabase の URL
- `SUPABASE_ANON_KEY`: Supabase の匿名キー

## 使用技術

- TypeScript
- Hono フレームワーク
- Supabase

## ライセンス

このプロジェクトは MIT ライセンスの下で提供されています。
