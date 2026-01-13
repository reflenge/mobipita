# Next.js における環境変数の扱い

## 基本的な使い方

`.env.local` ファイルに環境変数を定義すると、Node.js 環境で自動的に読み込まれます。

```env
DB_HOST=localhost
DB_USER=myuser
DB_PASS=mypassword
```

上記の設定により、以下のように環境変数にアクセスできます:

-   `process.env.DB_HOST`
-   `process.env.DB_USER`
-   `process.env.DB_PASS`

## ブラウザで使用できる環境変数

ブラウザ側で環境変数を使用するには、変数名の前に `NEXT_PUBLIC_` を付ける必要があります。

```env
NEXT_PUBLIC_ANALYTICS_ID=abcdefghijk
```

> ⚠️ `NEXT_PUBLIC_` プレフィックスを付けた変数は、クライアント側のコードに含まれるため、機密情報を含めないようにしてください。

## 環境変数の読み込み優先順位

環境変数は以下の順番で検索され、最初に見つかった値が使用されます:

1. `process.env`
2. `.env.$(NODE_ENV).local`
3. `.env.local` ※ `NODE_ENV` が `test` の場合は読み込まれません
4. `.env.$(NODE_ENV)`
5. `.env`

### 例

`NODE_ENV` が `development` の場合、`.env.development.local` と `.env` の両方で同じ変数が定義されていると、`.env.development.local` の値が優先されます。

### NODE_ENV の値

`NODE_ENV` には以下の 3 つの値のみ使用できます:

-   `production`
-   `development`
-   `test`

## Git 管理における注意点

環境変数ファイルは、その役割に応じて Git 管理の対象を分ける必要があります。

### デフォルト定義

以下のファイルはデフォルト定義として使用する:

-   `.env`
-   `.env.development`
-   `.env.production`

これらのファイルには、プロジェクト全体で共有する設定や、環境ごとのデフォルト値を記載します。

### 特に Git 管理から除外すべきファイル

以下のファイルはシークレットキーなど機密情報を含むため、**必ず `.gitignore` に追加**してください:

-   `.env*.local`（`.env.local`, `.env.development.local`, `.env.production.local` など）

```.gitignore
# 環境変数ファイル（ローカル設定）
.env*.local
.env*
```

> ⚠️ API キーやデータベースのパスワードなど、機密情報は `.env*.local` ファイルに記載し、Git にコミットしないようにしてください。

## 参考資料

-   [Next.js における環境変数 (env) の取り扱い | zenn](https://zenn.dev/hisayuki_mori/articles/environment-variables-for-nextjs)
