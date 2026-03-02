"use client";

import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    UsersIcon,
    ShieldAlertIcon,
    AlertTriangleIcon,
    Trash2Icon,
    ArrowRightIcon,
    TimerIcon,
    BanIcon,
    CalendarClockIcon,
    ClipboardListIcon,
    BellIcon,
    UserIcon,
    HashIcon,
    ArchiveIcon,
} from "lucide-react";
import { TiptapViewer } from "@/components/Tiptap/viewer";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_CONFIG: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" }
> = {
    open: { label: "受付中", variant: "default" },
    closed: { label: "締切", variant: "secondary" },
};

const VISIBILITY_CONFIG: Record<
    string,
    { label: string; variant: "default" | "secondary" | "outline" }
> = {
    public: { label: "公開", variant: "default" },
    unlisted: { label: "限定公開", variant: "outline" },
    private: { label: "非公開", variant: "secondary" },
};

export type SlotData = {
    _id: string;
    startAt: string;
    endAt: string;
    slotStatus: string;
    visibility: string;
    capacity: number;
    serviceName: string;
    serviceDeleted: boolean;
    snapshotServiceName?: string;
    locationName: string;
    locationDeleted: boolean;
    locationChanged: boolean;
    snapshotLocationName?: string;
    createdByUserId: string;
    policy: Record<string, unknown>;
    location: Record<string, unknown>;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slot: SlotData | null;
};

function formatTime(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return iso;
    }
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
        });
    } catch {
        return iso;
    }
}

function formatMinutes(min: string | number | unknown): string {
    const n = Number(min);
    if (Number.isNaN(n) || n <= 0) return "-";
    const days = Math.floor(n / (60 * 24));
    const hours = Math.floor((n % (60 * 24)) / 60);
    const minutes = n % 60;
    let result = "";
    if (days > 0) result += `${days}日`;
    if (hours > 0) result += `${hours}時間`;
    if (minutes > 0) result += `${minutes}分`;
    return result || "-";
}

function DeletedBadge() {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                        <Trash2Icon className="size-3" />
                        削除済み
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    このレコードは既に削除されています。スナップショットの情報を表示しています。
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function ChangedBadge({ from, to }: { from: string; to: string }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="outline"
                        className="gap-1 border-amber-500 text-[10px] text-amber-600 dark:text-amber-400"
                    >
                        <AlertTriangleIcon className="size-3" />
                        変更あり
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <span className="line-through opacity-60">
                                {from}
                            </span>
                            <ArrowRightIcon className="size-3 shrink-0" />
                            <span className="font-medium">{to}</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function SnapshotBlock({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-1 rounded-md border border-dashed border-amber-400/60 bg-amber-50/50 px-3 py-2 dark:bg-amber-950/20">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <ArchiveIcon className="size-3" />
                作成時のスナップショット
            </div>
            <div className="space-y-0.5 text-sm">{children}</div>
        </div>
    );
}

function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <Icon className="text-muted-foreground size-4" />
                {title}
            </div>
            <div className="space-y-1.5 pl-6">{children}</div>
        </div>
    );
}

function DetailRow({
    label,
    children,
    className,
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`flex items-baseline justify-between gap-4 text-sm ${className ?? ""}`}
        >
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="text-right">{children}</span>
        </div>
    );
}

export function SlotDetailDialog({ open, onOpenChange, slot }: Props) {
    if (!slot) return null;

    const policy = slot.policy;
    const location = slot.location;
    const cancellation = policy.cancellationPolicy as
        | Record<string, unknown>
        | undefined;
    const acceptance = policy.acceptanceWindow as
        | Record<string, unknown>
        | undefined;
    const form = policy.form as
        | {
              questions?: Array<{
                  label: string;
                  type: string;
                  required: boolean;
              }>;
          }
        | undefined;

    const statusCfg = STATUS_CONFIG[slot.slotStatus] ?? {
        label: slot.slotStatus,
        variant: "secondary" as const,
    };
    const visCfg = VISIBILITY_CONFIG[slot.visibility] ?? {
        label: slot.visibility,
        variant: "outline" as const,
    };

    const displayServiceName = slot.serviceDeleted
        ? slot.snapshotServiceName || null
        : slot.serviceName;

    const displayLocationName = slot.locationDeleted
        ? (slot.snapshotLocationName ?? null)
        : slot.locationName;

    const snapshotLoc = location as {
        name?: string;
        type?: string;
        semiAddress?: string;
        autoAddress?: string;
        details?: string;
    };

    const durationText = formatMinutes(policy.durationMinutes);
    const bufferText = formatMinutes(policy.bufferMinutes);
    const openBeforeText = acceptance
        ? `開始の${formatMinutes(acceptance.openBeforeMinutes)}前`
        : "-";
    const closeBeforeText = acceptance
        ? `開始の${formatMinutes(acceptance.closeBeforeMinutes)}前`
        : "-";
    const dailyLimitText =
        Number(policy.dailyBookingLimit) > 0
            ? `${Number(policy.dailyBookingLimit)}件`
            : "-";
    const cancelDeadlineText = cancellation
        ? `${formatMinutes(cancellation.cancelDeadlineMinutes)}前まで`
        : "-";
    const allowCustomerCancel = Boolean(cancellation?.allowCustomerCancel);
    const rescheduleText = cancellation?.allowRescheduling
        ? `可（${formatMinutes(cancellation.rescheduleDeadlineMinutes)}前まで）`
        : "不可";
    const reminders = policy.reminders as
        | Record<string, Record<string, unknown>>
        | undefined;
    const reminderText = reminders?.email?.amountMinutes
        ? `${formatMinutes(reminders.email.amountMinutes)}前`
        : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto p-0 sm:max-w-lg">
                {/* Header */}
                <div className="space-y-3 px-6 pt-6 pb-4">
                    <DialogHeader className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <DialogTitle className="text-lg">
                                {displayServiceName ?? "（不明なサービス）"}
                            </DialogTitle>
                            {slot.serviceDeleted && <DeletedBadge />}
                        </div>
                        {slot.serviceDeleted && (
                            <SnapshotBlock>
                                {displayServiceName ? (
                                    <p>サービス名: {displayServiceName}</p>
                                ) : (
                                    <p className="text-muted-foreground">
                                        サービス名はスナップショットに保存されていません
                                    </p>
                                )}
                                <p className="text-muted-foreground font-mono text-xs">
                                    ID: {String(slot.policy.serviceId ?? "")}
                                </p>
                            </SnapshotBlock>
                        )}
                        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                            <CalendarIcon className="size-3.5" />
                            {formatDate(slot.startAt)}
                        </div>
                    </DialogHeader>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusCfg.variant}>
                            {statusCfg.label}
                        </Badge>
                        <Badge variant={visCfg.variant}>{visCfg.label}</Badge>
                        <Badge variant="outline" className="gap-1">
                            <UsersIcon className="size-3" />
                            定員 {slot.capacity}名
                        </Badge>
                    </div>
                </div>

                <Separator />

                {/* Body */}
                <div className="space-y-5 px-6 py-4">
                    {/* 日時 */}
                    <Section icon={ClockIcon} title="日時">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span>{formatTime(slot.startAt)}</span>
                            <span className="text-muted-foreground">〜</span>
                            <span>{formatTime(slot.endAt)}</span>
                        </div>
                        <DetailRow label="枠の長さ">{durationText}</DetailRow>
                        <DetailRow label="バッファ">{bufferText}</DetailRow>
                    </Section>

                    <Separator />

                    {/* 場所 */}
                    <Section icon={MapPinIcon} title="場所">
                        {slot.locationDeleted ? (
                            <>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {displayLocationName ??
                                            "（不明な場所）"}
                                    </span>
                                    <DeletedBadge />
                                </div>
                                <SnapshotBlock>
                                    {snapshotLoc.name && (
                                        <p>{snapshotLoc.name}</p>
                                    )}
                                    {snapshotLoc.type && (
                                        <p className="text-muted-foreground text-xs">
                                            種別:{" "}
                                            {snapshotLoc.type === "fixed"
                                                ? "固定店舗"
                                                : "移動店舗"}
                                        </p>
                                    )}
                                    {snapshotLoc.semiAddress && (
                                        <p className="text-muted-foreground text-xs">
                                            {snapshotLoc.semiAddress}
                                        </p>
                                    )}
                                    {snapshotLoc.autoAddress &&
                                        snapshotLoc.autoAddress !==
                                            snapshotLoc.semiAddress && (
                                            <p className="text-muted-foreground text-xs">
                                                {snapshotLoc.autoAddress}
                                            </p>
                                        )}
                                    {snapshotLoc.details && (
                                        <p className="text-muted-foreground text-xs">
                                            {snapshotLoc.details}
                                        </p>
                                    )}
                                </SnapshotBlock>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {displayLocationName}
                                    </span>
                                    {slot.locationChanged &&
                                        slot.snapshotLocationName && (
                                            <ChangedBadge
                                                from={slot.snapshotLocationName}
                                                to={slot.locationName}
                                            />
                                        )}
                                </div>
                                {snapshotLoc.semiAddress && (
                                    <p className="text-muted-foreground text-xs">
                                        {snapshotLoc.semiAddress}
                                    </p>
                                )}
                            </>
                        )}
                    </Section>

                    <Separator />

                    {/* 受付設定 */}
                    <Section icon={TimerIcon} title="受付設定">
                        <DetailRow label="受付開始">{openBeforeText}</DetailRow>
                        <DetailRow label="受付締切">
                            {closeBeforeText}
                        </DetailRow>
                        <DetailRow label="1日の上限">
                            {dailyLimitText}
                        </DetailRow>
                    </Section>

                    {cancellation && (
                        <>
                            <Separator />
                            <Section
                                icon={ShieldAlertIcon}
                                title="キャンセルポリシー"
                            >
                                <DetailRow label="キャンセル期限">
                                    {cancelDeadlineText}
                                </DetailRow>
                                <DetailRow label="顧客キャンセル">
                                    <Badge
                                        variant={
                                            allowCustomerCancel
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="text-[10px]"
                                    >
                                        {allowCustomerCancel ? (
                                            <>
                                                <CalendarClockIcon className="size-3" />
                                                可
                                            </>
                                        ) : (
                                            <>
                                                <BanIcon className="size-3" />
                                                不可
                                            </>
                                        )}
                                    </Badge>
                                </DetailRow>
                                <DetailRow label="日時変更">
                                    {rescheduleText}
                                </DetailRow>
                            </Section>
                        </>
                    )}

                    {form?.questions && form.questions.length > 0 && (
                        <>
                            <Separator />
                            <Section icon={ClipboardListIcon} title="質問項目">
                                <ul className="space-y-1.5">
                                    {form.questions.map((q, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-sm"
                                        >
                                            <span className="text-muted-foreground mt-0.5 w-5 shrink-0 text-right font-mono text-xs">
                                                {i + 1}.
                                            </span>
                                            <div>
                                                <TiptapViewer
                                                    content={q.label}
                                                    size="sm"
                                                />
                                                <div className="mt-0.5 flex gap-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px]"
                                                    >
                                                        {q.type}
                                                    </Badge>
                                                    {q.required && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-[10px]"
                                                        >
                                                            必須
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        </>
                    )}

                    {reminderText && (
                        <>
                            <Separator />
                            <Section icon={BellIcon} title="リマインダー">
                                <DetailRow label="メール通知">
                                    {reminderText}
                                </DetailRow>
                            </Section>
                        </>
                    )}

                    <Separator />

                    {/* メタ情報 */}
                    <div className="text-muted-foreground space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                            <HashIcon className="size-3" />
                            <span className="font-mono break-all">
                                {slot._id}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <UserIcon className="size-3" />
                            <span className="font-mono break-all">
                                {slot.createdByUserId}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
