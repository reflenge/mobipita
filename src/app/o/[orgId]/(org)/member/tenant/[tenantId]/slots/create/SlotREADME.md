# slots/create - 予約枠作成画面

テナントごとの予約枠を新規作成するフォーム画面です。

---

## ファイル構成

```
slots/create/
├── page.tsx              # ページ（ルート）
├── createSlot.tsx        # メインコンポーネント
├── createSlotSkeleton.tsx # ローディング用スケルトン
├── slot-calender.tsx     # カレンダープレビュー（右カラム）
├── DateSlotTimeRanges.tsx # 日付＋時間帯入力の行
├── dateUtils.ts          # 日付ユーティリティ
├── schema.ts             # フォームの Zod スキーマ
├── form-fields/          # フォームフィールドコンポーネント群
│   ├── index.ts
│   ├── ServiceSelectField.tsx
│   ├── LocationSelectField.tsx
│   ├── VisibilitySelectField.tsx
│   ├── DurationInputField.tsx
│   ├── CapacityInputField.tsx
│   ├── OpenBeforeInputField.tsx
│   ├── CloseBeforeInputField.tsx
│   ├── BufferInputField.tsx
│   ├── DailyLimitInputField.tsx
│   ├── ReminderInputField.tsx
│   ├── CancelDeadlineInputField.tsx
│   ├── RescheduleDeadlineInputField.tsx
│   ├── AllowCustomerCancelField.tsx
│   ├── AllowReschedulingField.tsx
│   ├── DateTimeSlotsSection.tsx
│   ├── FormQuestionsSection.tsx
│   ├── CancellationPolicySection.tsx
│   ├── QuestionLabelField.tsx
│   ├── QuestionTypeField.tsx
│   └── QuestionRequiredField.tsx
└── SlotREADME.md
```

---

## 画面レイアウト

```
┌─────────────────────────────────────────────────────────────────┐
│ 予約枠作成                                                       │
│ {tenantName} {tenantId} の予約枠を新規作成します                  │
├──────────────────────────────────┬──────────────────────────────┤
│ 【左カラム】フォーム              │ 【右カラム】カレンダー        │
│                                  │                              │
│ サービス選択                      │  FullCalendar                │
│ 場所選択                         │  - 4日/日/週/月/リスト切替   │
│ 表示（公開/非公開）               │  - フォーム連動イベント表示  │
│                                  │  - 場所名をイベント内に表示  │
│ 枠の日時                         │  - 日付クリックで toast       │
│  - 日付を追加 ボタン              │                              │
│  - 日付 × 時間帯の一覧            │                              │
│                                  │                              │
│ 枠の長さ・同時予約数              │                              │
│ 受付開始・受付締切                │                              │
│ バッファ・1日あたり予約上限       │                              │
│ 予約時に聞く質問                  │                              │
│ リマインダー送信                  │                              │
│ キャンセル・変更ポリシー          │                              │
│                                  │                              │
│ [Reset] [作成する]                │                              │
└──────────────────────────────────┴──────────────────────────────┘
```

---

## データフロー

### 1. ページ（page.tsx）

- サーバーコンポーネント
- URL から `orgId`, `tenantId` を取得
- `<CreateSlot />` に渡す

### 2. メインコンポーネント（createSlot.tsx）

- **データ取得**: Convex で `tenant`, `services`, `locations` を取得
- **フォーム**: react-hook-form + zod でバリデーション
- **ローディング中**: `CreateSlotSkeleton` を表示
- **カレンダー連携**: `dateTimeSlots` + `durationMinutes` + `bufferMinutes` を `useWatch` で購読し、`useMemo` で個々の予約枠イベントに変換して `SlotCalender` に渡す
- **送信時**: `api.slots.createBatch` mutation を呼び出し、Convex DB に保存

### 3. フォームスキーマ（schema.ts）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| slotTemplate.tenantId | string | テナントID |
| slotTemplate.serviceId | string | サービスID |
| slotTemplate.defaultLocationId | string | 場所ID |
| slotTemplate.durationMinutes | number | 枠の長さ（分） |
| slotTemplate.defaultCapacity | number | 同時予約数 |
| slotTemplate.defaultVisibility | enum | public / unlisted / private |
| slotTemplate.acceptanceWindow | object | openBeforeMinutes, closeBeforeMinutes |
| slotTemplate.bufferMinutes | number | 枠間バッファ |
| slotTemplate.dailyBookingLimit | number | 1日あたり予約上限 |
| slotTemplate.form.questions | array | 予約フォームの質問項目 |
| slotTemplate.reminders.email.amountMinutes | number | リマインダー送信タイミング |
| slotTemplate.cancellationPolicy | object | キャンセル・リスケ期限・可否 |
| dateTimeSlots | array | 日付と時間帯の配列 |

---

## バリデーション戦略

- **フィールドレベル**: zodResolver + `mode:"all"` が自動処理（フォーマット・必須・最小値）
- **クロスフィールド**: `useWatch` → `useMemo` → `validateDateTimeSlots()` で同期計算し props で子に渡す
  - 過去日付チェック
  - 終了時刻 > 開始時刻
  - 時間帯の長さ >= 枠の長さ
  - 同一日付内の時間帯重複
  - 場所チェック（時間帯の locationId も defaultLocationId も未指定ならエラー）
- **submit 時**: zodResolver パス後、`crossFieldErrors` を追加チェック。エラーが残っていれば `setError` で表示して送信をブロック

> zodResolver に superRefine を含めると `mode:"all"` で変更フィールドのエラーしか更新されず古いエラーが残る問題があるため、superRefine は使わない。

---

## Convex DB 保存

### Slots テーブル（convex/schema.ts）

| カラム | 型 | 説明 |
|--------|-----|------|
| tenantId | Id\<"Tenants"\> | 所属テナント |
| serviceId | Id\<"Services"\> | 紐づくサービス |
| locationId | Id\<"Locations"\> | 紐づく場所 |
| startAt | string | 枠の開始日時（ISO 8601） |
| endAt | string | 枠の終了日時（ISO 8601） |
| slotStatus | "open" \| "closed" | 受付状態 |
| visibility | "public" \| "unlisted" \| "private" | 公開範囲 |
| capacity | number | 同時予約可能数 |
| createdByUserId | string | 作成者の Clerk userId |
| policySnapshot | string | slotTemplate 全体を `JSON.stringify` で保存 |
| locationSnapshot | string | 場所情報を `JSON.stringify` で保存 |

### 送信フロー（createSlot.tsx → convex/slots.ts）

1. フォームの `dateTimeSlots` を `durationMinutes` + `bufferMinutes` で個々の枠に展開
2. 各枠に `policySnapshot`（slotTemplate 全体を `JSON.stringify`）と `locationSnapshot`（場所情報を `JSON.stringify`）を付与
3. `api.slots.createBatch` mutation で一括 insert
4. 成功時に toast で件数を表示、エラー時はエラーメッセージを表示
5. 送信中はボタンが disabled になり「作成中…」表示

> policySnapshot には枠作成時点のテンプレ全項目がスナップショットとして固定される。後からテンプレを変更しても既存枠には影響しない。

---

## 主要コンポーネントの役割

### createSlot.tsx

- データフェッチ（tenant, services, locations）
- フォーム初期化と `useEffect` で初期値セット
- `useWatch` でリアルタイム値を購読
- クロスフィールドバリデーション（`useMemo` で同期計算）
- カレンダーイベント生成（`useMemo` で `dateTimeSlots` を個別枠に展開）
- `onSubmit` で Convex mutation 呼び出し
- 各セクションを `form-fields` から組み立て

### DateSlotTimeRanges.tsx

- 1つの「日付 + 複数時間帯」を表示
- 日付: Calendar の Popover
- 時間帯: `time` 型 Input（開始〜終了）+ 場所選択
- 「この日にちに別の時間帯を追加」「この時間帯を削除」ボタン

### DateTimeSlotsSection.tsx

- 「日付を追加」ボタン → 最新日付 + 1日 を追加
- 各日付ごとに `DateSlotTimeRanges` を表示
- 「この日付を削除」ボタン

### slot-calender.tsx

- FullCalendar でカレンダープレビュー表示
- `createSlot` から `events` props で受け取った予約枠をリアルタイム表示
- 各イベント内に場所名（`extendedProps.locationName`）を表示
- ビュー: 4日/日/週/月/リスト切替
- 日付クリック・イベントクリックで toast 表示

### dateUtils.ts

- `getTodayYYYYMMDD()` - 今日を yyyy-MM-dd で取得
- `parseDateYYYYMMDD(str)` - 文字列を Date に変換
- `formatDateJST(date)` - Date を「yyyy年M月d日」で表示
- `parseTimeToMinutes(str)` - 時刻文字列を 0:00 基準の分数に変換
- `addDaysToYYYYMMDD(dateStr, days)` - 日付に N 日加算
- `getTodayLocalYYYYMMDD()` - `getTodayYYYYMMDD` のエイリアス

---

## form-fields 一覧

| コンポーネント | フォームフィールド | UI |
|---------------|-------------------|-----|
| ServiceSelectField | slotTemplate.serviceId | Select |
| LocationSelectField | slotTemplate.defaultLocationId | Select |
| VisibilitySelectField | slotTemplate.defaultVisibility | Select |
| DurationInputField | slotTemplate.durationMinutes | Input (number) |
| CapacityInputField | slotTemplate.defaultCapacity | Input (number) |
| OpenBeforeInputField | acceptanceWindow.openBeforeMinutes | Input (number) |
| CloseBeforeInputField | acceptanceWindow.closeBeforeMinutes | Input (number) |
| BufferInputField | slotTemplate.bufferMinutes | Input (number) |
| DailyLimitInputField | slotTemplate.dailyBookingLimit | Input (number) |
| ReminderInputField | reminders.email.amountMinutes | Input (number) |
| CancelDeadlineInputField | cancellationPolicy.cancelDeadlineMinutes | Input (number) |
| RescheduleDeadlineInputField | cancellationPolicy.rescheduleDeadlineMinutes | Input (number) |
| AllowCustomerCancelField | cancellationPolicy.allowCustomerCancel | Switch |
| AllowReschedulingField | cancellationPolicy.allowRescheduling | Switch |
| DateTimeSlotsSection | dateTimeSlots | 複合（DateSlotTimeRanges） |
| FormQuestionsSection | slotTemplate.form.questions | 複合（QuestionLabel, Type, Required） |
| CancellationPolicySection | 上記4つをまとめたセクション | - |
