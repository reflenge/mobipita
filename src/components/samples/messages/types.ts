// メッセージの送信先スコープを表す型。
export type MessageScope = "global" | "organization";

// チャット一覧に表示するメッセージの形。
export type MessageItem = {
    // Convex のドキュメントID。
    _id: string;
    // 送信者の Clerk ユーザーID。
    userId: string;
    // 表示名（未設定の可能性あり）。
    name?: string | null;
    // アバター画像 URL（未設定の可能性あり）。
    pictureUrl?: string | null;
    // メッセージ本文。
    text: string;
    // 作成日時（Unix ms）。
    _creationTime: number;
    // 保存時のスコープ（既存データでは未設定の可能性あり）。
    scope?: MessageScope;
    // 組織メッセージの場合の組織ID。
    orgId?: string | null;
};
