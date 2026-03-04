# テナント情報編集ページ — UI 仕様書

2ページ構成:
- 基本情報編集: `/m/company/tenant/[tenantId]/edit`
- 詳細情報編集: `/m/company/tenant/[tenantId]/edit-detail`

---

## Context

### 現状の問題

- 編集ページがフラットなフォームで、詳細表示ページ（`tenantDetail/index.tsx`）のカード構成と視覚的な統一感がない
- ページタイトル・ナビゲーションの構造が詳細ページのヘッダーと揃っていない
- フォームフィールド間のグルーピングが弱い（FieldGroup のみで視覚的な区切りがない）

### ゴール

- 詳細表示ページのカード UI と対になる編集体験を実現する
- 既存のフィールドコンポーネント（`createTenantForm/_components`）を再利用する
- 視覚的な一貫性を保ちつつ、編集ページであることが明確に分かるようにする

---

## 既存コード（変更対象）

| ファイル | 役割 |
|----------|------|
| `src/app/m/company/tenant/[tenantId]/edit/page.tsx` | 基本情報編集ページ |
| `src/app/m/company/tenant/[tenantId]/edit-detail/page.tsx` | 詳細情報編集ページ |

### 再利用するコンポーネント（変更しない）

| ファイル | 役割 |
|----------|------|
| `src/app/m/company/tenant/_components/createTenantForm/TenantNameField.tsx` | テナント名入力 |
| `src/app/m/company/tenant/_components/createTenantForm/TenantPhoneField.tsx` | 電話番号入力 |
| `src/app/m/company/tenant/_components/createTenantForm/TenantTypeField.tsx` | テナント種別選択 |
| `src/app/m/company/tenant/_components/createTenantForm/TenantStatusField.tsx` | ステータス選択 |
| `src/app/m/company/tenant/_components/createTenantForm/TenantStoreTypeField.tsx` | 店舗形態選択 |
| `src/app/m/company/tenant/_components/createTenantForm/TenantLogoField.tsx` | ロゴ画像アップロード |
| `src/app/m/company/tenant/_components/createTenantForm/schema.ts` | Zod バリデーション |
| `src/components/ui/field.tsx` | Field / FieldGroup / FieldLabel 等 |

### 参考にするコンポーネント

| ファイル | 参考ポイント |
|----------|-------------|
| `src/app/m/company/tenant/_components/tenantDetail/index.tsx` | カードUI構造・ヘッダーデザイン・アイコン使用 |
| `src/app/m/company/tenant/_components/createTenantForm/index.tsx` | フォーム送信フロー・画像アップロード処理 |

---

## ページ1: 基本情報編集 (`edit/page.tsx`)

### 全体レイアウト

```
container (mx-auto, px-6, py-10, max-w-3xl)
├── ヘッダー行 (flex, justify-between, items-center)
│   ├── 左: h1 "基本情報の編集" (text-3xl, font-semibold)
│   └── 右: [戻る] ボタン (variant=outline)
│         → /m/company/tenant/[tenantId]
├── Separator
└── form
    ├── カード: テナント識別情報
    │   ├── カードヘッダー: アイコン(Info) + "テナント識別"
    │   └── カードコンテンツ
    │       ├── TenantNameField
    │       └── TenantLogoField
    ├── カード: 営業設定
    │   ├── カードヘッダー: アイコン(Settings) + "営業設定"
    │   └── カードコンテンツ
    │       ├── TenantTypeField
    │       ├── TenantStoreTypeField
    │       └── TenantStatusField
    └── ボタン行 (flex, justify-end, gap-3, pt-4)
        ├── [キャンセル] (variant=outline) → 詳細ページへ戻る
        └── [保存する] (type=submit, disabled=isPending)
            処理中: "保存中..."
```

### カードスタイル仕様

詳細表示ページ（`tenantDetail/index.tsx`）のカードスタイルを踏襲する:

```
section.overflow-hidden.rounded-xl.border.border-slate-200.bg-white.shadow-sm
├── ヘッダー (border-b border-slate-100 bg-slate-50/50 px-6 py-5)
│   └── h2 (flex items-center gap-2 text-xl font-semibold)
│       ├── アイコン (size-5, text-orange-500)
│       └── セクションタイトル
└── コンテンツ (p-6)
    └── FieldGroup
        └── 各フィールドコンポーネント
```

### 送信処理

現在の `edit/page.tsx` のロジックをそのまま維持する:
1. 画像が選択されていれば `generateUploadUrl` → fetch POST → `saveFile`
2. `api.tenants.update` を呼び出し
3. 画像があれば `updateFileStatus({ status: "attached" })`
4. 成功: toast "基本情報を更新しました" + 詳細ページへ遷移
5. 失敗: toast "更新に失敗しました" + description にエラーメッセージ

### ローディング状態 (tenant === undefined)

```
container
├── Skeleton (h-8 w-48)    // タイトル
├── Skeleton (h-64 w-full) // カード1
└── Skeleton (h-48 w-full) // カード2
```

### テナント未存在 (tenant === null)

```
container
├── p "テナントが見つかりません。" (text-muted-foreground)
└── [一覧へ戻る] ボタン (variant=outline)
    → /m/company/tenant
```

---

## ページ2: 詳細情報編集 (`edit-detail/page.tsx`)

### 全体レイアウト

```
container (mx-auto, px-6, py-10, max-w-3xl)
├── ヘッダー行 (flex, justify-between, items-center)
│   ├── 左: h1 "詳細情報の編集" (text-3xl, font-semibold)
│   └── 右: [戻る] ボタン (variant=outline)
│         → /m/company/tenant/[tenantId]
├── Separator
└── form
    ├── カード: 連絡先
    │   ├── カードヘッダー: アイコン(FileText) + "連絡先"
    │   └── カードコンテンツ
    │       └── TenantPhoneField
    └── ボタン行 (flex, justify-end, gap-3, pt-4)
        ├── [キャンセル] (variant=outline) → 詳細ページへ戻る
        └── [保存する] (type=submit, disabled=isPending)
            処理中: "保存中..."
```

### 送信処理

現在の `edit-detail/page.tsx` のロジックをそのまま維持する:
1. `api.tenants.updateDetail` を呼び出し
2. 成功: toast "詳細情報を更新しました" + 詳細ページへ遷移
3. 失敗: toast "更新に失敗しました" + description にエラーメッセージ

### バリデーション

現在のページ内インライン定義（`detailFormSchema`）を維持:
```ts
const detailFormSchema = z.object({
    phoneNumber: z.string()
        .regex(/^[0-9-]*$/, "電話番号は数字とハイフンのみで入力してください")
        .max(20, "20文字以内で入力してください")
        .transform((val) => (val === "" ? undefined : val))
        .optional(),
});
```

### ローディング・未存在状態

基本情報編集ページと同じパターン。

---

## 共通仕様

### ボタン一覧

| ボタン | variant | size | テキスト | 遷移先 |
|--------|---------|------|---------|--------|
| 戻る | outline | default | 戻る | /m/company/tenant/[tenantId] |
| キャンセル | outline | default | キャンセル | /m/company/tenant/[tenantId] |
| 保存する | default (primary) | default | 保存する / 保存中... | API 呼出 → 詳細ページ |

### アイコン（lucide-react）

| 用途 | アイコン | サイズ | 色 |
|------|---------|--------|-----|
| テナント識別カード | Info | size-5 | text-orange-500 |
| 営業設定カード | Settings | size-5 | text-orange-500 |
| 連絡先カード | FileText | size-5 | text-orange-500 |

### アクセシビリティ

- フォーム要素に `aria-invalid` 属性（既存フィールドコンポーネントで対応済み）
- Field に `role="group"` （field.tsx で対応済み）
- ボタンの disabled 状態（isPending 中）
- section 要素でカード領域をマークアップ

### エラーハンドリング

ConvexError（テナント名重複等）は既存の toast パターンで表示:
```ts
catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    toast("更新に失敗しました", {
        description: message,
        position: "bottom-right",
    });
}
```

---

## 変更しないこと

- フィールドコンポーネント（`TenantNameField` 等）の内部実装
- Zod スキーマ定義（`schema.ts`）
- Convex mutation（`tenants.ts`）
- 画像アップロードフロー
- ページの URL パス構造（`edit/` と `edit-detail/` の分離を維持）
