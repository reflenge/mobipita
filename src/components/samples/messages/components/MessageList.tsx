import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MessageItem } from "../types";

// メッセージ一覧表示の props。
type MessageListProps = {
    // 表示するメッセージ一覧。
    messages?: MessageItem[];
    // 自分のユーザーID（右寄せ判定用）。
    currentUserId?: string;
};

// メッセージをカード形式で表示するリスト。
const MessageList = ({ messages, currentUserId }: MessageListProps) => {
    return (
        <div className="max-h-100 overflow-y-scroll overflow-x-clip">
            {messages?.map((message) => (
                <div
                    key={message._id}
                    className={cn(
                        "border rounded-2xl max-w-3/4 px-4 py-2 my-2",
                        // 自分のメッセージは右寄せで区別する
                        message.userId === currentUserId
                            ? "bg-blue-100 self-end ml-auto rounded-tr-none"
                            : "bg-gray-100 rounded-tl-none"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Avatar>
                            <AvatarImage
                                src={message.pictureUrl ?? undefined}
                                alt={message.userId}
                            />
                            <AvatarFallback>
                                {message.name?.trim().slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <p>{message.name}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(message._creationTime).toLocaleString()}
                        </p>
                    </div>
                    <p>{message.text}</p>
                </div>
            ))}
        </div>
    );
};

export default MessageList;
