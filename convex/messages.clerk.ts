type ClerkUserProfile = {
    // 表示名（空の場合は null）。
    name: string | null;
    // アバター画像 URL（空の場合は null）。
    pictureUrl: string | null;
};

// Clerk の REST API を呼び出すためのベース URL。
const clerkApiBaseUrl = "https://api.clerk.com/v1";

// Convex の環境変数から Clerk の秘密鍵を取得する。
const getClerkSecretKey = () => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
        throw new Error("CLERK_SECRET_KEY が設定されていません。");
    }
    return secretKey;
};

// Clerk のユーザーデータから表示名を組み立てる。
const buildDisplayName = (user: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    email_addresses?: Array<{ email_address: string }>;
    full_name?: string | null;
}) => {
    // full_name があれば最優先で採用する。
    if (user.full_name && user.full_name.trim()) {
        return user.full_name.trim();
    }
    // first/last があれば結合して表示名にする。
    const fullName = [user.first_name, user.last_name]
        .filter((value) => value && value.trim())
        .join(" ")
        .trim();
    if (fullName) {
        return fullName;
    }
    // username があればフォールバックとして使う。
    if (user.username && user.username.trim()) {
        return user.username.trim();
    }
    // 最後の手段としてメールアドレスを使う。
    const primaryEmail = user.email_addresses?.[0]?.email_address;
    return primaryEmail ?? null;
};

// Clerk の REST API からユーザー情報を取得して表示用に整形する。
export const fetchClerkUserProfile = async (
    userId: string
): Promise<ClerkUserProfile> => {
    // サーバー側で Clerk API を呼び、最新のプロフィールを取得する。
    const response = await fetch(`${clerkApiBaseUrl}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${getClerkSecretKey()}`,
        },
    });
    // HTTP エラーはそのまま上位に伝搬させる。
    if (!response.ok) {
        throw new Error(`Clerk 取得エラー: ${response.status}`);
    }
    // 必要なプロパティだけ使う。
    const user = (await response.json()) as {
        first_name?: string | null;
        last_name?: string | null;
        username?: string | null;
        email_addresses?: Array<{ email_address: string }>;
        full_name?: string | null;
        image_url?: string | null;
    };
    return {
        name: buildDisplayName(user),
        pictureUrl: user.image_url ?? null,
    };
};
