import { Button } from "@/components/ui/button";
import type { MessageScope } from "../types";

// 送信先スコープの切り替え UI の props。
type MessageScopeSelectorProps = {
    // 現在選択中のスコープ。
    scope: MessageScope;
    // 組織が未選択のときは undefined。
    organizationId?: string;
    // 組織名のラベル表示用。
    organizationLabel: string;
    // スコープ変更時に呼び出す。
    onChange: (scope: MessageScope) => void;
};

// Global / Organization の切り替えボタン群。
const MessageScopeSelector = ({
    scope,
    organizationId,
    organizationLabel,
    onChange,
}: MessageScopeSelectorProps) => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                type="button"
                variant={scope === "global" ? "default" : "outline"}
                aria-pressed={scope === "global"}
                onClick={() => onChange("global")}
            >
                Global
            </Button>
            <Button
                type="button"
                variant={scope === "organization" ? "default" : "outline"}
                aria-pressed={scope === "organization"}
                onClick={() => onChange("organization")}
                disabled={!organizationId}
            >
                {organizationLabel}
            </Button>
        </div>
    );
};

export default MessageScopeSelector;
