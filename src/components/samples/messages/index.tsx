"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useOrganization, useUser } from "@clerk/nextjs";
import {
    Authenticated,
    useAction,
    useConvexAuth,
    useMutation,
    useQuery,
} from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/../convex/_generated/api";
import {
    messageFormSchema,
    type MessageFormValues,
} from "./shared/messageSchema";
import MessageForm from "./components/MessageForm";
import MessageList from "./components/MessageList";
import MessageScopeSelector from "./components/MessageScopeSelector";
import type { MessageScope } from "./types";

type UserProfile = {
    name: string | null;
    pictureUrl: string | null;
};

// チャットメッセージの送受信 UI をまとめたコンポーネント。
const Messages = () => {
    const { isAuthenticated } = useConvexAuth();
    // メッセージ送信の Mutation。
    const createMessage = useMutation(api.messages.create);
    const resolveUserProfiles = useAction(api.messages.resolveUserProfiles);
    const { user } = useUser();
    // Clerk の組織情報を取得する。
    const { organization } = useOrganization();
    const organizationId = organization?.id;
    const organizationLabel = organization?.name
        ? `Organization (${organization.name})`
        : "Organization";
    // 送信先スコープ（全体 / 組織）を UI で切り替える。
    const [scope, setScope] = useState<MessageScope>("global");

    // 組織が未選択のときは送信先を常にグローバル扱いにする。
    const effectiveScope: MessageScope =
        scope === "organization" && organizationId ? "organization" : "global";

    // 現在のスコープに応じてメッセージ一覧を取得する。
    const messages = useQuery(
        api.messages.lists,
        // 未認証のときはクエリを止める
        isAuthenticated
            ? {
                  scope: effectiveScope,
                  orgId:
                      effectiveScope === "organization"
                          ? organizationId
                          : undefined,
                  limit: 100,
              }
            : "skip"
    );

    const form = useForm<MessageFormValues>({
        resolver: zodResolver(messageFormSchema),
        defaultValues: {
            message: "",
        },
        mode: "all",
    });

    const [userProfiles, setUserProfiles] = useState<
        Record<string, UserProfile>
    >({});

    useEffect(() => {
        if (!messages || messages.length === 0) {
            return;
        }
        const userIds = Array.from(
            new Set(messages.map((message) => message.userId))
        );
        const missingUserIds = userIds.filter(
            (userId) => !userProfiles[userId]
        );
        if (missingUserIds.length === 0) {
            return;
        }
        let isActive = true;
        resolveUserProfiles({ userIds: missingUserIds })
            .then((profiles) => {
                if (!isActive) {
                    return;
                }
                setUserProfiles((prev) => ({
                    ...prev,
                    ...profiles,
                }));
            })
            .catch((error) => {
                console.error("ユーザー情報の取得に失敗しました。", error);
            });
        return () => {
            isActive = false;
        };
    }, [messages, resolveUserProfiles, userProfiles]);

    const messagesWithProfiles = useMemo(() => {
        if (!messages) {
            return messages;
        }
        return messages.map((message) => {
            const profile = userProfiles[message.userId];
            return {
                ...message,
                name: profile?.name ?? null,
                pictureUrl: profile?.pictureUrl ?? null,
            };
        });
    }, [messages, userProfiles]);

    // 送信前に組織条件を確認し、Convex に送る。
    const sendMessage = (values: MessageFormValues) => {
        if (effectiveScope === "organization" && !organizationId) {
            form.setError("message", {
                type: "manual",
                message: "Select an organization to send a message.",
            });
            return;
        }
        createMessage({
            text: values.message,
            scope: effectiveScope,
            orgId:
                effectiveScope === "organization" ? organizationId : undefined,
        });
        form.reset();
    };

    return (
        <Authenticated>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="fixed bottom-4 right-4 z-50 opacity-60 transition-opacity hover:opacity-100 active:opacity-100 focus-visible:opacity-100">
                        Messages
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Messages</DialogTitle>
                        {/* <DialogDescription className="flex items-center gap-2">
                            <Avatar>
                                <AvatarImage
                                    src={user?.imageUrl}
                                    alt={user?.id}
                                />
                                <AvatarFallback>
                                    {user?.fullName?.trim().slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            {user?.fullName}
                        </DialogDescription> */}
                    </DialogHeader>
                    {/* 送信先の切り替え UI */}
                    <MessageScopeSelector
                        scope={effectiveScope}
                        organizationId={organizationId}
                        organizationLabel={organizationLabel}
                        onChange={setScope}
                    />
                    {/* メッセージ一覧 */}
                    <MessageList
                        messages={messagesWithProfiles}
                        currentUserId={user?.id}
                    />
                    <DialogFooter className="flex-col!">
                        {/* 入力フォーム */}
                        <MessageForm form={form} onSubmit={sendMessage} />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Authenticated>
    );
};

export default Messages;
