# Mobipita 開発ガイドライン

高齢者向けサービスの予約管理システム。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + React 19
- **バックエンド**: Convex (BaaS)
- **認証**: Clerk (`@clerk/nextjs`)
- **スタイル**: TailwindCSS 4 + Radix UI + shadcn/ui
- **フォーム**: React Hook Form + Zod
- **決済**: Stripe / Stripe Connect (V2)
- **アイコン**: lucide-react
- **日付**: date-fns
- **地図**: Leaflet + react-leaflet
- **カレンダー**: FullCalendar
- **パスエイリアス**: `@/*` → `src/*`

## コードスタイル

Prettier 準拠。既存コードのパターンに従い、新しい書き方を発明しない。

- インデント: 4スペース
- クォート: ダブルクォート `"`
- セミコロン: あり
- trailing comma: あり
- printWidth: 80

## ルール

### 1. 既存パターンに従う（最重要）

新しいファイルや関数を書く際は、既存の同種コードを参照して合わせること。独自のパターンを発明しない。

### 2. セキュリティ

- 入力値は Zod スキーマでバリデーション（`convex/` 側と `src/` 側の両方）
- Convex 関数では `convex/lib/clerkAuth.ts` の認証ヘルパーを使う
- API ルート（`src/app/api/`）では `auth()` で認証チェック
- 機密情報はコードに含めない（.sops.yaml で暗号化管理）

### 3. 高齢者向けアクセシビリティ

- **文字サイズ**: 本文 16px 以上、操作ラベル 18px 以上
- **コントラスト**: WCAG AA（4.5:1 以上）
- **タッチターゲット**: 44x44px 以上
- **aria 属性**: インタラクティブ要素に適切な `aria-label` / `role`

### 4. ファイルパスの明示

コード提案時は対象ファイルパスを必ず明示する。

### 5. 環境制約（ARM64 Windows）

- シェル構文は bash（Unix 形式）を使用
- コマンド失敗時は深追いせずコード編集に集中

## Convex 関数パターン

```ts
// Query: 認証チェック → データ取得
export const list = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        return ctx.db.query("Tenants").order("desc").take(args.limit ?? 50);
    },
});

// Query: TenantDetails 結合 + logoUrl 取得パターン
export const getById = query({
    args: { tenantId: v.id("Tenants") },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant) return null;
        const detail = await ctx.db.query("TenantDetails")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
            .unique();
        let logoUrl = null;
        if (tenant.tenantLogoFileId) {
            const fileDoc = await ctx.db.get(tenant.tenantLogoFileId);
            if (fileDoc) logoUrl = await ctx.storage.getUrl(fileDoc.storageId);
        }
        return { ...tenant, phoneNumber: detail?.phoneNumber ?? "", logoUrl };
    },
});

// Mutation: userId 取得 → データ作成
export const create = mutation({
    args: { tenantName: v.string() },
    handler: async (ctx, args) => {
        const userId = await requireClerkUserId(ctx);
        return ctx.db.insert("Tenants", { createdByUserId: userId, ...args });
    },
});

// ロール制限: requireMinRole / requireAdmin / requireStaffOrAbove
// エラーは ConvexError で日本語メッセージ
```

## フォームパターン

```tsx
// RHF + Zod + FormProvider（createTenantForm を参照）
const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { /* ... */ },
    mode: "all",
});

// フィールドコンポーネント: src/components/ui/field.tsx
<FieldGroup>
    <Field>
        <FieldLabel>ラベル</FieldLabel>
        <Input {...register("fieldName")} />
        {errors.fieldName && <FieldError>{errors.fieldName.message}</FieldError>}
    </Field>
</FieldGroup>
```

## API ルートパターン

```ts
// src/app/api/ 配下の認証チェック
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Stripe 関連は src/lib/stripe-connect.ts を参照
}
```

## プロジェクト構成

```
src/app/(TOP)/        — 公開ランディングページ
src/app/(customer)/   — 顧客向け予約ポータル
src/app/m/admin/      — システム管理者（admin ロール）
src/app/m/company/    — 企業管理（company ロール以上）
src/app/m/staff/      — スタッフ運用（staff ロール以上）
src/app/api/          — API ルート（Stripe 等）
convex/               — バックエンド（スキーマ・関数）
convex/lib/           — 認証ヘルパー（clerkAuth.ts）
convex/values.ts      — 値の定義（enum 相当）
src/components/ui/    — 共通 UI（shadcn/ui）
src/components/map/   — 地図コンポーネント（Leaflet）
src/lib/roles.ts      — ロール定義・ヘルパー
src/lib/stripe*.ts    — Stripe ヘルパー
Docs/                 — 設計ドキュメント（詳細仕様はここ）
```

## ロール階層

`admin`(40) > `company`(30) > `staff`(20) > `customer`(10)

- 定義: `convex/values.ts` + `src/lib/roles.ts`
- 認証ヘルパー: `convex/lib/clerkAuth.ts`
- `requireMinRole(ctx, "staff")` で最小権限を指定

## 値の定義（convex/values.ts）

| 名前 | 値 |
|------|-----|
| tenantType | `direct`, `tenant` |
| tenantStatus | `preparing`, `open`, `paused`, `closed` |
| storeType | `mobile`, `fixed` |
| slotStatus | `open`, `closed` |
| slotVisibility | `public`, `unlisted`, `private` |
| bookingStatus | `pending`, `confirmed`, `canceled`, `no_show` |
| fileStatus | `temporary`, `attached` |

## DB テーブル一覧（convex/schema.ts）

Files, Tenants, TenantDetails, TenantMemberAssignments, Locations, Services, Slots, Bookings, StaffTags, UserProfiles, StripeConnectAccounts, StripeConnectSubscriptions

## 廃止事項

- `/o/[orgId]/` パスは廃止済み → `/m/` を使用する
- `clerkOrgId` フィールドは使用しない
- `tenantSlug` フィールドは使用しない

---

## Workflow Orchestration

### 1. Plan First
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Include verification steps in the plan, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via parallel subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for the relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in with the user before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Minimal code impact.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
