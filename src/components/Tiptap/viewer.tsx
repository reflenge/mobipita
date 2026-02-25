'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const viewerVariants = cva('pointer-events-none', {
    variants: {
        size: {
            sm: 'prose-sm',
            base: 'prose-base',
            lg: 'prose-lg',
        },
        lines: {
            1: 'line-clamp-1',
            2: 'line-clamp-2',
            3: 'line-clamp-3',
            4: 'line-clamp-4',
            5: 'line-clamp-5',
            6: 'line-clamp-6',
        },
    },
    defaultVariants: {
        size: 'sm',
    },
})

type Props = {
    content: string
    className?: string
} & VariantProps<typeof viewerVariants>

export function TiptapViewer({ content, className, size, lines }: Props) {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_p]:my-2',
            },
        },
    })

    if (!editor) return null

    return (
        <EditorContent
            editor={editor}
            className={cn(viewerVariants({ size, lines }), className)}
        />
    )
}
