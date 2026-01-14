import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { MessageFormValues } from "../shared/messageSchema";

// 入力フォームの props。
type MessageFormProps = {
    // react-hook-form のフォーム状態。
    form: UseFormReturn<MessageFormValues>;
    // 送信時に呼ぶハンドラ。
    onSubmit: (values: MessageFormValues) => void;
};

// メッセージ入力フォーム。
const MessageForm = ({ form, onSubmit }: MessageFormProps) => {
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-2"
            >
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input {...field} placeholder="Type a message" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Send</Button>
            </form>
        </Form>
    );
};

export default MessageForm;
