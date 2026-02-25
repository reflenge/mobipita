// =========================
// 1) プラン（Service）
// =========================
// 「基本ずっと同じ」もの。頻繁に変えない前提の箱。
export type Service = {
    id: string;
    tenantId: string;
    title: string;
    description: string;
    isActive: boolean;
};

// =========================
// 2) テンプレ（Slot Template / Policy）
// =========================
// 「よく使うルール」を使い回すための箱。
// 重要：予約枠を作るときに、このテンプレ内容を"スナップショット"として枠に固定する。
// ルール：slotTemplates にあるもの（枠に効くルール・デフォルト値）はすべて slot.policySnapshot にコピーする。
//        枠作成時点のテンプレを固定し、後からテンプレを変更しても既存枠には影響しない。

// 受付期間
export type AcceptanceWindow = {
    openBeforeMinutes: number; // 60日前から受付
    closeBeforeMinutes: number; // 3時間前で締切
};

// フォーム質問
export type FormQuestion = {
    id: string;
    label: string;
    type: "text" | "tel" | "textarea";
    required: boolean;
};

// フォーム（お客に聞く質問セット）
export type Form = {
    questions: FormQuestion[];
};

// リマインダー（メール）
export type EmailReminder = {
    timing: "beforeStart";
    amountMinutes: number; // 1日前
};

// カレンダー招待
// Googleカレンダーに限らず「ICS」等の形式で配布する想定
export type CalendarInvite = {
    mode: "icsOrAddUrl";
    enabled: boolean;
};

// リマインダー
export type Reminders = {
    email: EmailReminder;
    calendarInvite: CalendarInvite;
};

// キャンセル・変更ポリシー
// （必要なら）feePolicy（キャンセル時の手数料や返金ルール）、penalty（違反時のペナルティ）、refundPolicy（返金の細かい条件や方法）などもこの中に追加可能です。
// 例:
// feePolicy: { type: "fixed", amount: 1000 } // 固定手数料
// penalty: { lateCancel: 2000 } // 直前キャンセル時の追加料金
// refundPolicy: { fullRefundBeforeMinutes: 1440, partialRefundBeforeMinutes: 120 } // 開始前何分なら全額返金、部分返金等
// サービスや運用に応じて必要な属性を拡張して利用できます。
export type CancellationPolicy = {
    cancelDeadlineMinutes: number; // 開始の1時間前までキャンセル可
    allowCustomerCancel: boolean; // 顧客キャンセル可否
    allowRescheduling: boolean; // 顧客の日時変更可否
    rescheduleDeadlineMinutes: number; // 変更期限（2時間前まで）
};

export type SlotTemplate = {
    id: string;
    tenantId: string;
    serviceId: string;
    // ----- 枠生成時のデフォルト（Slot にコピーし、必要なら枠ごとに上書き） -----
    durationMinutes: number; // 枠の長さ。テンプレ名 tpl_normal_60 と一致
    defaultCapacity: number; // 同時並行予約数。枠ごとに変えるなら slot で上書き
    defaultVisibility: "public" | "unlisted" | "private";
    // オプション：主に使う場所・リソース（枠生成UIの初期値に使う）
    defaultLocationId?: string;
    defaultResources?: Resource[];
    // ----- 受付・制限・ポリシー -----
    acceptanceWindow: AcceptanceWindow;
    bufferMinutes: number; // バッファ（枠間の準備時間）
    dailyBookingLimit: number; // 「1日あたりの予約枠上限」
    // ※ここでは "成立した予約(Booking)数" を数える想定（slot数ではない）
    form: Form;
    reminders: Reminders;
    cancellationPolicy: CancellationPolicy;
};

// =========================
// 3) 場所（Location）
// =========================
// 住所＋座標＋詳細。固定店舗も移動先も同じ"場所"として扱う。

export type GeoCoordinates = {
    lat: number;
    lng: number;
};

export type Location = {
    id: string;
    tenantId: string;
    type: "fixed" | "mobile"; // fixed | mobile
    name: string;
    address: string;
    geo: GeoCoordinates;
    details: string;
    mapUrl: string;
};

// =========================
// 4) 予約枠（Slot）
// =========================
// 日々追加する"実体"。長さ・バッファ・収容数・表示設定は policySnapshot にのみ持つ（重複しない）。
// 重要：templateの内容は slot にスナップショットとして固定する（後からテンプレを変えても枠は変わらない）。

// Resource競合管理（レベル1：Slot作成時に競合を防ぐ）
export type Resource = {
    resourceId: string;
    units: number;
    // 例：コート1、車1なども追加可能
};

// スナップショット（枠作成時点のテンプレ全項目を固定。slotTemplates にあるものはここにすべて入れる）
export type PolicySnapshot = {
    durationMinutes: number;
    bufferMinutes: number;
    defaultCapacity: number;
    defaultVisibility: "public" | "unlisted" | "private";
    acceptanceWindow: AcceptanceWindow;
    dailyBookingLimit: number;
    form: Form;
    reminders: Reminders;
    cancellationPolicy: CancellationPolicy;
};

// 場所も「マスタが後で編集されても、枠の集合案内が変わらない」よう固定したい場合はここも持つ
export type LocationSnapshot = {
    type: "fixed" | "mobile"; // fixed | mobile
    name: string;
    address: string;
    geo: GeoCoordinates;
    details: string;
    mapUrl: string;
};

export type Slot = {
    id: string;
    tenantId: string;
    serviceId: string;
    startAt: string; // ISO 8601形式の日時文字列
    endAt: string; // ISO 8601形式の日時文字列
    templateId: string;
    locationId: string;
    slotStatus: "open" | "closed"; // "open" | "closed"（手動で受付停止。予約データは消さない）
    // 満員は policySnapshot.defaultCapacity と confirmed数から算出。一覧を速くしたいなら availabilitySnapshot を非正規化で持ってもOK
    // ※durationMinutes, bufferMinutes, defaultCapacity, defaultVisibility は policySnapshot を参照
    resources: Resource[];
    policySnapshot: PolicySnapshot;
    locationSnapshot: LocationSnapshot;
};

// =========================
// 5) 予約（Booking）
// =========================
// お客の申込データ。slotIdに紐づき、capacityの範囲内で成立する。

// キャンセル・変更ポリシー（スナップショット：予約作成時に固定）
export type BookingPolicySnapshot = {
    cancellationPolicy: CancellationPolicy;
};

export type Booking = {
    id: string;
    tenantId: string;
    slotId: string;
    status: "pending" | "confirmed" | "canceled" | "no_show"; // pending仮確定 | confirmed確定 | canceledキャンセル | no_show未出席
    clerkUserId: string;
    // フォーム回答（slot.policySnapshot.form.questions と対応）
    answers: Record<string, string>;
    createdAt: string; // ISO 8601形式の日時文字列
    policySnapshot: BookingPolicySnapshot;
};

// =========================
// 6) 通知ログ（Notification Logs）
// =========================
// トラブル対応と二重送信防止（冪等性）のために必須。
// 送った/送ってない、失敗した、再送の管理。
// 冪等キー：(bookingId, type, scheduledFor) を unique にする
// → ジョブが二重実行されても二重送信しない

export type NotificationLog = {
    id: string;
    tenantId: string;
    bookingId: string;
    type: "reminder_1day" | "reminder_immediate" | "calendar_invite" | string; // "reminder_1day" | "reminder_immediate" | "calendar_invite" ...
    channel: "email" | "sms" | "push"; // "email" | "sms" | "push"
    scheduledFor: string; // 送るべき時刻（ISO 8601形式の日時文字列）
    sentAt: string | null; // 実際に送信した時刻（ISO 8601形式の日時文字列）
    status: "scheduled" | "sent" | "failed" | "skipped"; // "scheduled" | "sent" | "failed" | "skipped"
    providerMessageId: string | null; // 外部送信の識別子（冪等性確保）
    error: string | null; // 失敗時のエラー情報
};

// =========================
// 参考：実装上の注意
// =========================
//
// 【policySnapshot に含めるもの】
// - slot: 枠作成時に slotTemplates の全項目をコピー（durationMinutes, bufferMinutes, defaultCapacity,
//   defaultVisibility, acceptanceWindow, dailyBookingLimit, form, reminders, cancellationPolicy。
//   追加するテンプレ項目があれば同様に snapshot に入れる）。
// - booking: 予約作成時に slot.policySnapshot のうち予約に効く部分（主に cancellationPolicy）をコピー。
//
// - 予約枠生成（営業時間×長さ×バッファ）を行う場合、
//   「startAt + duration <= endOfBusiness」を満たす枠だけ作る。
//
// - capacity超過の判定は、
//   bookings のうち status=confirmed を数えて slot.policySnapshot.defaultCapacity と比較する。
//
// - dailyBookingLimit の判定は、
//   「同じ日付」「同じserviceId（または運用単位）」で confirmed を数える。
//
// - "予約が入った枠"は、時間/場所/長さ/policySnapshot.defaultCapacity/必須フォーム をロックし、
//   変えたい場合は「枠を締切→新枠作成（改訂）」にするのが事故りにくい。
//
// =========================
// 追加機能の実装上の注意
// =========================
//
// 【Slotのライフサイクル管理】
// - 予約できる = slotStatus=open かつ remaining > 0 かつ 受付期限内 かつ policySnapshot.defaultVisibility 条件を満たす
// - slotStatus=closed でも既存Bookingは維持（キャンセルしない）
// - isFull は policySnapshot.defaultCapacity と confirmed数から算出（enumに full を入れるより、open/closed + 残数=0 が一貫）
//
// 【Bookingのキャンセル・変更ポリシー】
// - 顧客キャンセル可 = now <= slot.startAt - cancelDeadline
// - 顧客変更可 = allowRescheduling && now <= slot.startAt - rescheduleDeadline
// - 管理者は原則 override 可能（運用で必要）
//
// 【Resource競合（レベル1：Slot作成時に競合を防ぐ）】
// - Slot作成/編集時に「同じresourceIdが同時間帯に使われるSlotが存在したらNG」
// - これだけで「スタッフAが2つの枠に同時に入る」問題が消える
//
// 【通知ログ】
// - 送信前に status=scheduled を作成 → 成功で sent、失敗で failed（リトライ可能）
// - 冪等キー：(bookingId, type, scheduledFor) を unique にする
//
// =========================
// 他に検討できる項目（slotTemplates / Slot / Booking）
// =========================
//
// 【slotTemplates】※追加した項目も slot.policySnapshot にコピーする。
// - confirmMode: 即時確定 vs 承認制（pending → スタッフ承認 → confirmed）
// - maxAttendeesPerBooking: 1予約あたりの人数上限（グループ枠で「1件＝最大4名」など）
// - defaultSlotStatus: 枠作成時の open/closed
// - price, paymentType: 料金・支払い方法（free / pay_at_venue / pay_online）
// - internalNote: スタッフ用メモ（顧客非表示）
// - displayOrder, color: 一覧・カレンダー表示用
//
// 【Slot】
// - priceOverride: 枠ごとに料金を変える場合（テンプレの price を上書き）
//
// 【Booking】
// - attendeeCount: 予約人数（maxAttendeesPerBooking と組み合わせて超過チェック）
// - internalNote: スタッフ用メモ（例：クレーム対応済みなど）
// - confirmedAt: 承認制の場合の確定日時
// - source: "web" | "admin" | "api" など（集計・分析用）
