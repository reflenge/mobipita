This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

OK、言いたいことわかった。
細かい仕様じゃなくて、**「結局なにをどうすれば shop(Tenant)作成が動くの？」**を **手順だけ**で分かりやすくまとめるね。

---

# ✅ 結局やることは「3つ」だけ

## ① Tenantテーブルと Fileテーブルを作る

- **Tenant**：店の情報（名前・slug・直営/テナント・ステータス・ロゴ参照）
- **File**：アップロードしたファイル情報（storageId・名前・サイズ…）

👉 Tenantのロゴは `storageId` を直接持たず、**filesの \_id を参照**するのが正解。

---

## ② ロゴアップロード → Tenant作成の “流れ” を作る

やりたい動作はこれだけ：

### ✅ 店作成の流れ（これが完成形）

1. 画像を選ぶ（FilePond）
2. Convexに画像アップロード（storageIdをもらう）
3. `files` テーブルに temporary で保存（fileIdをもらう）
4. 「作成する」押す
5. `tenants` を作る（logo は fileId を入れる）
6. files を attached にする（tenantに紐付ける）

---

## ③ 画面（フォーム）を作る

- React Hook Form + Zodで入力チェック
- FilePondでロゴ1枚アップロード
- tenantName / tenantSlug / tenantType を送る

---

# ✅ “何をどこに書くか” 最短チェックリスト

## 1) パッケージ入れる

```bash
pnpm add react-hook-form zod @hookform/resolvers filepond react-filepond filepond-plugin-image-preview
```

---

## 2) Convexのschemaを書く

`convex/schema.ts` に

- `tenants` テーブル
    - `clerkOrgId`
    - `tenantName`
    - `tenantSlug`
    - ✅ `tenantType: direct | tenant`
    - `tenantLogoFileId?`
    - `tenantStatus: preparing/open/paused/closed`
    - index: `by_org_slug`

- `files` テーブル
    - `storageId`
    - `fileName`
    - `contentType`
    - `size`
    - `status: temporary/attached`

---

## 3) Convexの関数を3つ作る

### A. ロゴアップロード用URLを発行する

`convex/files.ts`

- `generateUploadUrl({ clerkOrgId })`

### B. filesに temporary 保存する

`convex/fileRecords.ts`

- `createFileRecord(...)`
- `deleteTemporaryFile(...)`（FilePondで削除押した時用）

### C. tenantsを作る（slug重複チェック込み）

`convex/tenants.ts`

- `createTenant(...)`
    - index `by_org_slug` を使って **slug重複なら弾く**
    - ロゴがあれば files を `attached` に更新

---

## 4) Next.js側にフォームを置く

### CSS import（layout.tsx）

```ts
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
```

### フォームコンポーネント

`components/CreateTenantForm.tsx`

- FilePond で画像をアップロード
- 画像がアップロードできたら `tenantLogoFileId` を保持
- submit で `createTenant` を呼ぶだけ

### ページに置く

`app/o/[orgId]/(org)/admin/tenant/new/page.tsx`
で

```tsx
<CreateTenantForm clerkOrgId={params.orgId} />
```

---

# ✅ ここだけ理解しておけばOK（超重要ポイント）

## ✅ 「URLをDBに保存しない」

保存するのはこれだけ：

- `files.storageId`
- `tenants.tenantLogoFileId`（files参照）

---

## ✅ FilePondは “先にアップロード” してOK

「作成ボタン押した時にアップロード」じゃなくて

- 画像選択した瞬間にアップロードして fileId作る
- 作成ボタンで tenantに紐付ける

この方式が一番ラク。

---

## ✅ slug重複は “DB制約じゃなくて” mutationで弾く

Convexは unique制約がないから

- `by_org_slug` index を作る
- 作成前に検索して存在したらエラー

これが正しいやり方。

---

# ✅ 直営/テナント追加はこうなる

Tenantにこれを1行追加するだけ。

- `tenantType: "direct" | "tenant"`

フォームにはプルダウンで出すだけ。

---

# ✅ 最後に：権限（Clerk adminだけ作れる）について

「adminだけTenant作れる」にしたいなら

- Convex mutation の中で **admin/owner か判定する**

これだけ。

（ここはあとで「一旦ログインしてれば作れる」でもOK。まず動かすなら簡略化できる）

---

# じゃあ次どうする？

ここまでで「何をすればいいか」は整理できたので、

次は俺が **そのままコピペできる完全セット**を出すのが早い。

✅ あなたの今のリポジトリ構成に合わせて

- `schema.ts`
- `files.ts / fileRecords.ts / tenants.ts`
- `CreateTenantForm.tsx`（FilePond/RHF/Zod）
  を **全部まとめて貼れる形**にして出せるよ。

もし “権限チェックは一旦なしで動かしたい” ならそれ前提で最短版にする。
