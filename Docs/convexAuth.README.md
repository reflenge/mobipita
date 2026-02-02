# Convex と Clerk の認証統合

## 概要

Convex と Clerk を統合する際は、認証状態に基づいて UI を表示するために **Convex の認証コンポーネント**を使用する必要があります。

## 重要なポイント

### Clerk のコンポーネントではなく Convex のコンポーネントを使用する

| Clerk のコンポーネント | Convex のコンポーネント | 用途                              |
| ---------------------- | ----------------------- | --------------------------------- |
| `<SignedIn>`           | `<Authenticated>`       | 認証済みユーザーに表示する UI     |
| `<SignedOut>`          | `<Unauthenticated>`     | 未認証ユーザーに表示する UI       |
| `<ClerkLoading>`       | `<AuthLoading>`         | 認証状態の読み込み中に表示する UI |

### useAuth() ではなく useConvexAuth() を使用する

認証状態を確認する際は、Clerk の `useAuth()` フックではなく、**Convex の `useConvexAuth()` フック**を使用してください。

```tsx
import { useConvexAuth } from "convex/react";

function MyComponent() {
    const { isAuthenticated, isLoading } = useConvexAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div>Please sign in</div>;
    }

    return <div>Welcome!</div>;
}
```

### なぜ useConvexAuth() を使うのか？

`useConvexAuth()` は以下を保証します:

1. **ブラウザが認証トークンを取得済み** - Convex バックエンドへの認証リクエストに必要
2. **Convex バックエンドがトークンを検証済み** - セキュアな API 呼び出しが可能

## 実装例

### 基本的な使い方

```tsx
"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
    return (
        <>
            <Authenticated>
                <UserButton />
                <Content />
            </Authenticated>
            <Unauthenticated>
                <SignInButton />
            </Unauthenticated>
        </>
    );
}

function Content() {
    const messages = useQuery(api.messages.getForCurrentUser);
    return <div>認証済みコンテンツ: {messages?.length}</div>;
}
```

### ヘッダーコンポーネントの例

```tsx
"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import {
    OrganizationSwitcher,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs";

export default function Header() {
    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16">
            <Authenticated>
                <OrganizationSwitcher />
                <UserButton />
            </Authenticated>
            <Unauthenticated>
                <SignInButton />
                <SignUpButton>
                    <button>Sign Up</button>
                </SignUpButton>
            </Unauthenticated>
        </header>
    );
}
```

### ローディング状態の処理

```tsx
"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export default function App() {
    return (
        <>
            <AuthLoading>
                <div>認証状態を確認中...</div>
            </AuthLoading>
            <Authenticated>
                <div>認証済みコンテンツ</div>
            </Authenticated>
            <Unauthenticated>
                <div>ログインしてください</div>
            </Unauthenticated>
        </>
    );
}
```

## 認証を必要とする Convex クエリ

`<Authenticated>` コンポーネント内では、認証を必要とする Convex クエリを安全に呼び出せます:

```tsx
function AuthenticatedContent() {
    // このコンポーネントは <Authenticated> 内にあるため、
    // 認証済みユーザーであることが保証されている
    const userMessages = useQuery(api.messages.getForCurrentUser);
    const userProfile = useQuery(api.users.getCurrentProfile);

    return (
        <div>
            <h1>あなたのメッセージ: {userMessages?.length}</h1>
            <p>ようこそ、{userProfile?.name}さん</p>
        </div>
    );
}
```

## ベストプラクティス

1. **Client Component として定義** - Convex の認証コンポーネントを使用するコンポーネントには `"use client"` ディレクティブを追加
2. **認証状態の確認には useConvexAuth()** - Clerk の `useAuth()` は使用しない
3. **適切なコンポーネントを使用** - 認証状態に応じて `<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>` を使い分ける
4. **認証が必要なクエリは Authenticated 内で** - 認証を必要とする Convex クエリは `<Authenticated>` コンポーネント内で呼び出す

## 注意事項

-   Convex の認証コンポーネントを使用することで、Convex バックエンドとの認証状態が正しく同期されます
-   Clerk のコンポーネントはフロントエンド側の認証状態しか確認できないため、Convex との統合では使用しないでください
-   認証状態の読み込みが完了する前に認証が必要なコンテンツを表示しないよう、`<AuthLoading>` を適切に使用してください

## 参考資料

-   [Convex Authentication Documentation](https://docs.convex.dev/auth)
-   [Clerk + Convex Integration Guide](https://docs.convex.dev/auth/clerk)
