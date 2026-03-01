import { type ComponentType } from "react";
import { notFound, redirect } from "next/navigation";
import { AccountNotifications } from "./notifications";
import { AccountProfile } from "./profile";

export interface AccountPageProps {
    basePath: string;
    segments: string[];
}

const pages: Record<string, ComponentType<AccountPageProps>> = {
    profile: AccountProfile,
    notifications: AccountNotifications,
};

const DEFAULT_PAGE = "profile";

interface AccountProps {
    params: Promise<{ account?: string[] }>;
    basePath: string;
}

export const Account = async ({ params, basePath }: AccountProps) => {
    const { account } = await params;
    const page = account?.[0];

    if (!page) redirect(`${basePath}/${DEFAULT_PAGE}`);

    const Page = pages[page];
    if (!Page) notFound();

    return <Page basePath={basePath} segments={account?.slice(1) ?? []} />;
};
