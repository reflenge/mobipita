# テナント詳細ページ — UI 仕様書

パス: `/m/company/tenant/[tenantId]`

---

## ページ全体レイアウト

```
container (mx-auto, px-6, py-10, gap-8)
├── ヘッダー行 (flex, justify-between)
│   ├── 左: タイトル + サブテキスト
│   │   ├── h1 "テナント詳細" (text-3xl, font-semibold)
│   │   └── "Tenant ID: xxxxx" (text-sm, muted)
│   └── 右: [一覧へ戻る] ボタン (outline)
├── 区切り線 (Separator)
├── カード1: 基本情報
├── カード2: 詳細情報
└── 削除セクション
```

---

## カード1: 基本情報

### ヘッダー

| 要素 | 仕様 |
|------|------|
| タイトル | "基本情報" / text-xl / font-semibold |
| 編集ボタン | outline, size-sm, アイコン Edit2(16px) + "基本情報を編集" |
| レイアウト | flex, justify-between, items-center |

遷移先: `/m/company/tenant/[tenantId]/edit`

### コンテンツ

#### ロゴ + テナント名 (flex, items-center, gap-4)

| 要素 | 仕様 |
|------|------|
| ロゴ枠 | 64x64px, rounded-lg, bg-gray-100, border border-gray-200 |
| ロゴ画像 | object-cover で全面表示。未設定時は ImageIcon(24px) をグレーで表示 |
| テナント名 | text-lg, font-bold |

#### 情報テーブル (space-y-3, text-base)

各行: flex, items-center, justify-between

| 行 | ラベル | 値の表示形式 |
|----|--------|-------------|
| 1 | ステータス | pill バッジ (後述の色テーブル参照) |
| 2 | テナント種別 | pill バッジ (後述の色テーブル参照) |
| 3 | 店舗形態 | pill バッジ (後述の色テーブル参照) |
| 4 | 作成日時 | テキスト (例: "2026/03/03 14:30") |
| 5 | 作成者 | テキスト (ユーザーID) |

ラベル: text-muted-foreground (グレー系)
値テキスト: text-foreground (黒系)

---

## カード2: 詳細情報

### ヘッダー

| 要素 | 仕様 |
|------|------|
| タイトル | "詳細情報" / text-xl / font-semibold |
| 編集ボタン | outline, size-sm, アイコン Edit2(16px) + "詳細情報を編集" |

遷移先: `/m/company/tenant/[tenantId]/edit-detail`

### コンテンツ (space-y-3, text-base)

| 行 | ラベル | 値の表示形式 |
|----|--------|-------------|
| 1 | 連絡先（電話番号） | テキスト (例: "03-1234-5678") / 未設定時 "未設定" |

---

## 削除セクション

| 要素 | 仕様 |
|------|------|
| レイアウト | flex, justify-end, pt-2 |
| ボタン | variant=destructive (赤), アイコン Trash2(16px) + "テナントを削除" |

### 削除確認ダイアログ

| 要素 | 仕様 |
|------|------|
| タイトル | "テナントを削除しますか？" |
| 説明文 | "「{テナント名}」を削除します。この操作は元に戻せません。" |
| キャンセルボタン | variant=outline, "キャンセル" |
| 削除ボタン | variant=destructive, "削除する" / 処理中は "削除中..." + disabled |
| 背景 | 半透明オーバーレイ (bg-black/50) |

---

## pill バッジ 色テーブル

共通スタイル: `inline-flex items-center px-2.5 py-0.5 text-sm font-semibold rounded-full border`

### ステータス (tenantStatus)

| 値 | ラベル | 背景色 | 文字色 | ボーダー色 |
|----|--------|--------|--------|-----------|
| preparing | 準備中 | yellow-100 (#fef9c3) | yellow-700 (#a16207) | yellow-200 (#fef08a) |
| open | 公開中 | green-100 (#dcfce7) | green-700 (#15803d) | green-200 (#bbf7d0) |
| paused | 一時停止 | gray-100 (#f3f4f6) | gray-600 (#4b5563) | gray-200 (#e5e7eb) |
| closed | 終了 | red-100 (#fee2e2) | red-700 (#b91c1c) | red-200 (#fecaca) |

### テナント種別 (tenantType)

| 値 | ラベル | 背景色 | 文字色 | ボーダー色 |
|----|--------|--------|--------|-----------|
| direct | 直営 | orange-100 (#ffedd5) | orange-700 (#c2410c) | orange-200 (#fed7aa) |
| tenant | テナント | slate-100 (#f1f5f9) | slate-600 (#475569) | slate-200 (#e2e8f0) |

### 店舗形態 (storeType)

| 値 | ラベル | 背景色 | 文字色 | ボーダー色 |
|----|--------|--------|--------|-----------|
| mobile | 移動店舗 | blue-100 (#dbeafe) | blue-700 (#1d4ed8) | blue-200 (#bfdbfe) |
| fixed | 固定店舗 | slate-100 (#f1f5f9) | slate-600 (#475569) | slate-200 (#e2e8f0) |

---

## 状態別の表示

### ローディング中

```
├── カード1 (Skeleton)
│   ├── CardHeader: Skeleton h-6 w-48
│   └── CardContent: Skeleton h-4 x3 (w-56, w-40, w-44)
└── カード2 (Skeleton)
    ├── CardHeader: Skeleton h-6 w-32
    └── CardContent: Skeleton h-4 w-40
```

### テナント未存在 (削除済み / 権限なし)

```
Card (border-dashed)
├── CardTitle: "テナントが見つかりません"
├── テキスト: "すでに削除されたか、権限がありません。"
└── [一覧へ戻る] ボタン (outline)
```

---

## ボタン仕様まとめ

| ボタン | variant | size | アイコン | テキスト | 遷移先 |
|--------|---------|------|---------|---------|--------|
| 一覧へ戻る | outline | default | なし | 一覧へ戻る | /m/company/tenant |
| 基本情報を編集 | outline | sm | Edit2 16px | 基本情報を編集 | /m/company/tenant/[id]/edit |
| 詳細情報を編集 | outline | sm | Edit2 16px | 詳細情報を編集 | /m/company/tenant/[id]/edit-detail |
| テナントを削除 | destructive | default | Trash2 16px | テナントを削除 | ダイアログ表示 |
| キャンセル | outline | default | なし | キャンセル | ダイアログ閉じる |
| 削除する | destructive | default | なし | 削除する | API呼出→一覧へ遷移 |

---

## サンプルデータ

```json
{
  "tenantName": "カフェ高知駅前店",
  "tenantStatus": "open",
  "tenantType": "tenant",
  "storeType": "mobile",
  "phoneNumber": "03-1234-5678",
  "createdAt": "2026/03/01 10:00",
  "createdByUserId": "user_2abc123def456",
  "logoUrl": null
}
```
