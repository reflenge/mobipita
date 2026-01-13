"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { useUser } from "@clerk/nextjs";
import {
    Authenticated,
    useConvexAuth,
    useMutation,
    useQuery,
} from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "@/../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
    messageFormSchema,
    messageMaxLength,
    type MessageFormValues,
} from "@/shared/messageSchema";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const Messages = () => {
    const { isAuthenticated } = useConvexAuth();
    const createMessage = useMutation(api.messages.create);
    const listsMessages = useQuery(
        api.messages.lists,
        isAuthenticated ? {} : "skip"
    );
    const { user } = useUser();
    // 初回ロードで通知が出ないよう、既読メッセージを保持する。
    const seenMessageIds = useRef<Set<string>>(new Set());
    const hasInitializedMessages = useRef(false);
    // console.log("🚀 => Messages => user:", user);

    const form = useForm<MessageFormValues>({
        resolver: zodResolver(messageFormSchema),
        defaultValues: {
            message: "",
        },
        mode: "all",
    });

    const sendMessage = (values: MessageFormValues) => {
        createMessage({ text: values.message });
        form.reset();
    };

    // 初回ロード後に届いた新着メッセージのみ通知する。
    useEffect(() => {
        if (!listsMessages) {
            return;
        }
        if (!hasInitializedMessages.current) {
            listsMessages.forEach((message) =>
                seenMessageIds.current.add(message._id)
            );
            hasInitializedMessages.current = true;
            return;
        }
        const newMessages = listsMessages.filter(
            (message) => !seenMessageIds.current.has(message._id)
        );
        if (newMessages.length === 0) {
            return;
        }
        newMessages.forEach((message) =>
            seenMessageIds.current.add(message._id)
        );
        newMessages.forEach((message) => {
            if (message.userId === user?.id) {
                return;
            }
            toast(message.name ?? "New message", {
                description: message.text,
            });
        });
    }, [listsMessages, user?.id]);

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
                            {user?.fullName} さん
                        </DialogDescription> */}
                    </DialogHeader>
                    {/* content */}
                    <div className="max-h-100 overflow-y-scroll overflow-x-clip">
                        {listsMessages?.map((message) => (
                            <div
                                key={message._id}
                                className={cn(
                                    "border rounded-2xl max-w-3/4 px-4 py-2 my-2",
                                    message.userId === user?.id
                                        ? "bg-blue-100 self-end ml-auto rounded-tr-none"
                                        : "bg-gray-100 rounded-tl-none"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarImage
                                            src={message.pictureUrl}
                                            alt={message.userId}
                                        />
                                        <AvatarFallback>
                                            {message.name?.trim().slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p>{message.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(
                                            message._creationTime
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <p>{message.text}</p>
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="flex-col!">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(sendMessage)}
                                className="flex w-full flex-col gap-2"
                            >
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Type a message"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit">Send</Button>
                            </form>
                        </Form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Authenticated>
    );
};

export default Messages;
