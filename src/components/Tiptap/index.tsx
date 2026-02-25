"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ToolMenu from "./menu";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
} from "@/components/ui/input-group";

type Props = {
    sentence: string;
    setSentence: (sentence: string) => void;
    maxLength?: number;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onBlur"> & {
        // react-hook-form の field.onBlur を受け取るため、引数なしの onBlur を許可する
        onBlur?: () => void;
    };

const Tiptap = ({
    sentence,
    setSentence,
    className,
    onBlur,
    maxLength,
    ...props
}: Props) => {
    const editor = useEditor({
        extensions: [StarterKit],
        // 初期値も HTML 文字列として扱う
        content: sentence,
        editorProps: {
            attributes: {
                // リストのマーカーがリセット CSS で消されないように、ここで強制的に設定
                class: "prose prose-base m-2 focus:outline-none h-full min-h-48 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4",
            },
        },
        // サーバーサイドレンダリングの問題を避けるため、すぐにはレンダリングしません
        immediatelyRender: false,
    });

    // エディタの内容（HTML） → フォーム値 への同期
    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
            // 装飾込みの HTML をそのままフォーム値として渡す
            setSentence(editor.getHTML());
        };

        const handleBlur = () => {
            onBlur?.();
        };

        editor.on("update", handleUpdate);
        editor.on("blur", handleBlur);

        return () => {
            editor.off("update", handleUpdate);
            editor.off("blur", handleBlur);
        };
    }, [editor, setSentence, onBlur]);

    // フォーム値（HTML） → エディタ内容 への同期（reset 等に対応）
    useEffect(() => {
        if (!editor) return;

        const current = editor.getHTML();
        if (sentence !== current) {
            // emitUpdate を false にして、ここからの setContent では update イベントを発火させない
            editor.commands.setContent(sentence, { emitUpdate: false });
        }
    }, [editor, sentence]);

    if (!editor) {
        return null;
    }

    return (
        <InputGroup>
            <ToolMenu editor={editor} />
            <EditorContent
                editor={editor}
                data-slot="input-group-control"
                className={className}
                {...props}
            />
            <InputGroupAddon align="block-end">
                <InputGroupText className="tabular-nums">
                    {maxLength
                        ? `${sentence.length}/${maxLength}`
                        : `${sentence.length} 文字`}
                </InputGroupText>
            </InputGroupAddon>
        </InputGroup>
    );
};

export default Tiptap;
