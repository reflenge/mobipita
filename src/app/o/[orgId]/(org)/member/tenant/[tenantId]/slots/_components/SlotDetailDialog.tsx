"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
    open: "受付中",
    closed: "締切",
};

const VISIBILITY_LABEL: Record<string, string> = {
    public: "公開",
    unlisted: "限定公開",
    private: "非公開",
};

type SlotData = {
    _id: string;
    startAt: string;
    endAt: string;
    slotStatus: string;
    visibility: string;
    capacity: number;
    serviceName: string;
    locationName: string;
    createdByUserId: string;
    policy: Record<string, unknown>;
    location: Record<string, unknown>;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slot: SlotData | null;
};

function formatDateTime(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return iso;
    }
}

function formatMinutes(min: unknown): string {
    const n = Number(min);
    if (Number.isNaN(n) || n <= 0) return "-";
    if (n < 60) return `${n}分`;
    const h = Math.floor(n / 60);
    const m = n % 60;
    return m ? `${h}時間${m}分` : `${h}時間`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[120px_1fr] gap-2 py-1.5 border-b last:border-b-0">
            <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
            <dd className="text-sm">{children}</dd>
        </div>
    );
}

export function SlotDetailDialog({ open, onOpenChange, slot }: Props) {
    if (!slot) return null;

    const policy = slot.policy;
    const location = slot.location;
    const cancellation = policy.cancellationPolicy as Record<string, unknown> | undefined;
    const acceptance = policy.acceptanceWindow as Record<string, unknown> | undefined;
    const form = policy.form as { questions?: Array<{ label: string; type: string; required: boolean }> } | undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{slot.serviceName}</DialogTitle>
                    <DialogDescription>
                        {formatDateTime(slot.startAt)} 〜 {formatDateTime(slot.endAt)}
                    </DialogDescription>
                </DialogHeader>

                <dl className="space-y-0">
                    <InfoRow label="ステータス">
                        <Badge variant={slot.slotStatus === "open" ? "default" : "secondary"}>
                            {STATUS_LABEL[slot.slotStatus] ?? slot.slotStatus}
                        </Badge>
                    </InfoRow>

                    <InfoRow label="公開範囲">
                        {VISIBILITY_LABEL[slot.visibility] ?? slot.visibility}
                    </InfoRow>

                    <InfoRow label="定員">
                        {slot.capacity}名
                    </InfoRow>

                    <InfoRow label="場所">
                        <div>{slot.locationName}</div>
                        {(location as { semiAddress?: string }).semiAddress && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                                {location.semiAddress as string}
                            </div>
                        )}
                    </InfoRow>

                    <InfoRow label="枠の長さ">
                        {formatMinutes(policy.durationMinutes)}
                    </InfoRow>

                    <InfoRow label="バッファ">
                        {formatMinutes(policy.bufferMinutes)}
                    </InfoRow>

                    <InfoRow label="受付開始">
                        {acceptance
                            ? `開始の${formatMinutes(acceptance.openBeforeMinutes)}前`
                            : "-"}
                    </InfoRow>

                    <InfoRow label="受付締切">
                        {acceptance
                            ? `開始の${formatMinutes(acceptance.closeBeforeMinutes)}前`
                            : "-"}
                    </InfoRow>

                    <InfoRow label="1日上限">
                        {policy.dailyBookingLimit
                            ? `${policy.dailyBookingLimit}件`
                            : "-"}
                    </InfoRow>

                    {cancellation && (
                        <>
                            <InfoRow label="キャンセル期限">
                                {formatMinutes(cancellation.cancelDeadlineMinutes)}前まで
                            </InfoRow>
                            <InfoRow label="顧客キャンセル">
                                {cancellation.allowCustomerCancel ? "可" : "不可"}
                            </InfoRow>
                            <InfoRow label="日時変更">
                                {cancellation.allowRescheduling
                                    ? `可（${formatMinutes(cancellation.rescheduleDeadlineMinutes)}前まで）`
                                    : "不可"}
                            </InfoRow>
                        </>
                    )}

                    {form?.questions && form.questions.length > 0 && (
                        <InfoRow label="質問項目">
                            <ul className="space-y-1">
                                {form.questions.map((q, i) => (
                                    <li key={i} className="text-xs">
                                        <span
                                            dangerouslySetInnerHTML={{ __html: q.label }}
                                        />{" "}
                                        <span className="text-muted-foreground">
                                            ({q.type}{q.required ? ", 必須" : ""})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </InfoRow>
                    )}

                    <InfoRow label="作成者ID">
                        <span className="text-xs font-mono break-all">
                            {slot.createdByUserId}
                        </span>
                    </InfoRow>

                    <InfoRow label="枠ID">
                        <span className="text-xs font-mono break-all">
                            {slot._id}
                        </span>
                    </InfoRow>
                </dl>
            </DialogContent>
        </Dialog>
    );
}
