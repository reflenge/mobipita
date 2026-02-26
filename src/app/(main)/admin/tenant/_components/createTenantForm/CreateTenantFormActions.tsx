"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { CreateTenantFormValues } from "./schema";

const FORM_ID = "form-admin-tenant-create";

type CreateTenantFormActionsProps = {
    /** 送信処理中かどうか（ボタン無効化・スピナー表示に使用） */
    isPending: boolean;
    /** リセット押下時に親の state（ファイル・アップロード結果）をクリアするコールバック */
    onReset: () => void;
};

/** テナント作成フォームのフッター（リセット・作成するボタン） */
export function CreateTenantFormActions({
    isPending,
    onReset,
}: CreateTenantFormActionsProps) {
    const { reset } = useFormContext<CreateTenantFormValues>();

    const handleReset = () => {
        reset(); // フォーム値を初期値に戻す
        onReset(); // 画像・アップロード結果をクリア
    };

    return (
        <Field orientation="horizontal">
            <Button type="button" variant="outline" onClick={handleReset}>
                リセット
            </Button>
            <Button type="submit" form={FORM_ID} disabled={isPending}>
                {isPending ? (
                    <>
                        <Spinner />
                        作成中...
                    </>
                ) : (
                    "作成する"
                )}
            </Button>
        </Field>
    );
}
