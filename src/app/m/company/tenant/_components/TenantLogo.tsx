import { ImageIcon } from "lucide-react";

type TenantLogoProps = {
    logoUrl: string | null;
    tenantName: string;
    /** "NO IMAGE" ラベルを表示するか（一覧カード用） */
    showLabel?: boolean;
};

/** テナントロゴ画像。画像未設定・読込失敗時はフォールバックアイコンを表示する。 */
const TenantLogo = ({
    logoUrl,
    tenantName,
    showLabel = false,
}: TenantLogoProps) => {
    return (
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <div className="flex flex-col items-center text-slate-400">
                <ImageIcon className="size-8" />
                {showLabel && (
                    <span className="mt-0.5 text-[10px]">NO IMAGE</span>
                )}
            </div>
            {logoUrl && (
                <img
                    src={logoUrl}
                    alt={tenantName}
                    loading="eager"
                    crossOrigin="anonymous"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                    }}
                />
            )}
        </div>
    );
};

export default TenantLogo;
