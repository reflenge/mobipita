# Messages 技術資料

## 概要
- Clerk 認証下でチャットメッセージを送受信する機能。
- Convex の `messages` 関数で保存・取得を行い、クライアントはスコープ（全体 / 組織）を切り替えて表示する。

## 関連ファイル
- `convex/messages.ts`: メッセージ保存・取得の Convex 関数。
- `src/components/samples/messages/index.tsx`: サンプルのメッセージ UI と送受信処理。
- `src/components/samples/messages/components/MessageScopeSelector.tsx`: 送信先スコープ切り替え UI。
- `src/components/samples/messages/components/MessageList.tsx`: メッセージ一覧表示。
- `src/components/samples/messages/components/MessageForm.tsx`: 入力フォーム。
- `src/components/samples/messages/shared/messageSchema.ts`: バリデーションスキーマ（zod）。
- `src/components/samples/messages/types.ts`: `MessageScope` と `MessageItem` 型。

## データモデル
- テーブル: `Messages`
- 保存フィールド
  - `text`: メッセージ本文（必須、1-140 文字）。
  - `userId`: 送信者の Clerk ユーザー ID。
  - `scope`: 送信先スコープ（`global` / `organization`）。
  - `orgId`: 組織チャットの場合の組織 ID（`scope=organization` のとき必須）。
- 自動付与フィールド
  - `_id`, `_creationTime`（Convex が付与）
- 表示名とアバターは保存せず、`userId` を使って Clerk から都度取得する。

## Convex API
### `messages.create`
- 役割: メッセージを保存する Mutation。
- 引数
  - `text: string`
  - `scope: "global" | "organization"`
  - `orgId?: string`
- 処理
  - `messageTextSchema` で本文検証。
  - `ctx.auth.getUserIdentity()` で認証チェック。
  - 組織スコープ時は `orgId` 必須。
  - `Messages` に本文・送信者情報・スコープを保存。
- エラー文言（日本語）
  - 未認証: `認証されていないため、送信できません。`
  - 組織ID不足: `組織チャットには組織IDが必要です。`

### `messages.lists`
- 役割: メッセージ一覧取得の Query。
- 引数
  - `scope: "global" | "organization"`
  - `orgId?: string`
  - `limit?: number`（省略時は 100 件）
- 処理
  - 認証チェック。
  - 組織スコープ時は `orgId` 必須。
  - スコープに応じたインデックスで降順取得し、最大 `limit` 件まで返す。
    - `organization`: `scope=organization` と `orgId` の複合インデックスで取得
    - `global`: `scope=global` のインデックスで取得
- エラー文言（日本語）
  - 未認証: `認証されていないため、取得できません。`
  - 組織ID不足: `組織チャットには組織IDが必要です。`

### `messages.resolveUserProfiles`
- 役割: `userId` から Clerk の最新プロフィールを取得する Action。
- 引数
  - `userIds: string[]`
- 返却
  - `{ [userId]: { name: string | null; pictureUrl: string | null } }`
- エラー文言（日本語）
  - 未認証: `認証されていないため、取得できません。`
  - `CLERK_SECRET_KEY` 未設定時は例外を投げる。

## クライアント実装（サンプル）
### スコープ制御
- `MessageScopeSelector` で `scope` を切り替える。
- `organizationId` が無い場合は `effectiveScope` を `global` に固定。

### 一覧取得
- `useQuery(api.messages.lists, { scope: effectiveScope, orgId })`
- 未認証の場合は `skip` でクエリ停止。
- `useAction(api.messages.resolveUserProfiles)` を呼び出し、名前・アバターをマージして表示する。

### 送信
- `useMutation(api.messages.create)` で送信。
- `scope=organization` で `organizationId` が無い場合はフォームエラーを表示。
- 送信後にフォームをリセット。

### UI 構成
- `MessageList`: `MessageItem` を受け取り、送信者が本人の場合は右寄せ。
- `MessageForm`: `react-hook-form` で入力を管理。
- `messageSchema`: `text` は 1-140 文字、必須。

## 追加 UI（別実装）
- `src/components/messages.tsx` では新着メッセージを `toast` で通知する。
- 既読メッセージ ID を `useRef` に保持し、初回ロードは通知しない。

## 注意点・改善余地
- `lists` が全件取得後にフィルタするため、データ量が増えると非効率（インデックスや `filter` の導入を検討）。
- 組織メッセージ送信時の組織メンバー検証は行っていない（必要ならサーバー側で確認する）。
