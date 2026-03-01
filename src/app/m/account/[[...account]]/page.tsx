import { Account } from "@/components/account";

export default async function Page({
    params,
}: {
    params: Promise<{ account?: string[] }>;
}) {
    return <Account params={params} basePath="/m/account" />;
}
