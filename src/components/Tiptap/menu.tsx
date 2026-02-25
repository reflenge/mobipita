import { Editor } from "@tiptap/react";
import {
    Bold,
    Strikethrough,
    Redo,
    Undo,
    Underline,
    Eraser,
    RemoveFormatting,
    List,
    ListOrdered,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const ToolMenu = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }

    const size = 20;

    return (
        <div className="bg-muted/40 [&>section>button]:hover:bg-muted flex w-full flex-wrap items-center gap-3 border-b border-gray-200 px-2 py-1 text-sm [&>section]:flex [&>section]:items-center [&>section]:gap-1 [&>section]:px-1 [&>section>button]:inline-flex [&>section>button]:h-8 [&>section>button]:w-8 [&>section>button]:items-center [&>section>button]:justify-center [&>section>button]:rounded-md [&>section>button]:transition-colors">
            <section>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleBold().run()
                            }
                        >
                            <Bold size={size} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>太字</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleStrike().run()
                            }
                        >
                            <Strikethrough size={size} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>取り消し線</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleUnderline().run()
                            }
                        >
                            <Underline size={size} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>下線</p>
                    </TooltipContent>
                </Tooltip>
            </section>
            <section>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleBulletList().run()
                            }
                        >
                            <List size={size} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>リスト</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() =>
                                editor.chain().focus().toggleOrderedList().run()
                            }
                        >
                            <ListOrdered size={size} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>番号付きリスト</p>
                    </TooltipContent>
                </Tooltip>
            </section>
            <section>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .unsetAllMarks()
                                    .clearNodes()
                                    .run()
                            }
                        >
                            <Eraser size={size} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>クリア</p>
                    </TooltipContent>
                </Tooltip>
            </section>
            <section>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() => {
                                editor
                                    .chain()
                                    .selectAll()
                                    .unsetAllMarks()
                                    .clearNodes()
                                    .run();
                            }}
                        >
                            <RemoveFormatting size={size} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>リセット</p>
                    </TooltipContent>
                </Tooltip>
            </section>

            <section>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => editor.chain().focus().undo().run()}
                            type="button"
                        >
                            <Undo size={size} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>元に戻す</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => editor.chain().focus().redo().run()}
                            type="button"
                        >
                            <Redo size={size} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>やり直す</p>
                    </TooltipContent>
                </Tooltip>
            </section>
        </div>
    );
};

export default ToolMenu;
