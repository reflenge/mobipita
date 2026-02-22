# slots/create - 予約枠作成画面

テナントごとの予約枠を新規作成するフォーム画面です。

---

## ファイル構成

```
slots/create/
├── page.tsx              # ページ（ルート）
├── createSlot.tsx        # メインコンポーネント
├── createSlotSkeleton.tsx # ローディング用スケルトン
├── slot-calender.tsx     # カレンダー表示（右カラム）
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
└── README.md
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
│ 場所選択                         │  - 4日ビュー                 │
│ 表示（公開/非公開）               │  - イベント表示              │
│                                  │  - 日付クリックで toast       │
│ 枠の日時                         │                              │
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
- **送信時**: 現状は `onSubmit` で toast に JSON 表示のみ（API 未接続）

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

## 主要コンポーネントの役割

### createSlot.tsx

- データフェッチ（tenant, services, locations）
- フォーム初期化と `useEffect` で初期値セット
- 各セクションを `form-fields` から組み立て

### DateSlotTimeRanges.tsx

- 1つの「日付 + 複数時間帯」を表示
- 日付: Calendar の Popover
- 時間帯: `time` 型 Input（開始〜終了）
- 「この日にちに別の時間帯を追加」「この時間帯を削除」ボタン

### DateTimeSlotsSection.tsx

- 「日付を追加」ボタン → 最新日付 + 1日 を追加
- 各日付ごとに `DateSlotTimeRanges` を表示
- 「この日付を削除」ボタン

### slot-calender.tsx

- FullCalendar でカレンダー表示
- 現状はモックイベント固定（フォームとは連携なし）
- 日付クリック・イベントクリックで toast 表示

### dateUtils.ts

- `getTodayYYYYMMDD()` - 今日を yyyy-MM-dd で取得
- `parseDateYYYYMMDD(str)` - 文字列を Date に変換
- `formatDateJST(date)` - Date を「yyyy年M月d日」で表示
- `addDaysToYYYYMMDD(dateStr, days)` - 日付に N 日加算

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

---

## 今後の拡張候補

- フォーム送信を Convex mutation に接続
- SlotCalender とフォームの dateTimeSlots を連携（作成予定の枠をカレンダーに表示）
- バリデーション強化（終了 > 開始、日付の重複チェックなど）
