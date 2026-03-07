import type { Id } from "@/../convex/_generated/dataModel";

/** 編集ダイアログ用のタグフォーム状態 */
export type EditTagForm = {
    id: Id<"StaffTags">;
    title: string;
    description: string;
    color: string;
};
