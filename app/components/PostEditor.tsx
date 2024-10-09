import {
    EditorContent, EditorContext,
    EditorProvider, useCurrentEditor, useEditor,
} from "@tiptap/react";

import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import {Youtube} from "@tiptap/extension-youtube";
import {all, createLowlight} from "lowlight";
import {CodeBlockLowlight} from "@tiptap/extension-code-block-lowlight";
import React, {createRef, forwardRef, useImperativeHandle, useState} from "react";
import {CharacterCount} from "@tiptap/extension-character-count";
import {Placeholder} from "@tiptap/extension-placeholder";
import useOverflow from "@/utils/useOverflow";
import {Button} from "@ui/button";
import UserAvatar from "@components/UserAvatar";

const lowlight = createLowlight(all);

const characterCountLimit = 300;

const viewExtensions = [
    Document,
    Paragraph,
    Text,
    Image,
    Dropcursor,
    CodeBlockLowlight.configure({
        lowlight,
    }),
    Youtube.configure({
        controls: false,
        nocookie: true
    }),
    CharacterCount.configure({
        limit: characterCountLimit
    }),
]

export interface PostEditorElement {
    getContent: () => string;
    clearEditor(): void;
}

export const PostEditor = React.forwardRef((props: any, ref) => {
    const extensions = [
        Document,
        Paragraph,
        Text,
        Image,
        Dropcursor,
        CodeBlockLowlight.configure({
            lowlight,
        }),
        Youtube.configure({
            controls: false,
            nocookie: true
        }),
        CharacterCount.configure({
            limit: characterCountLimit,
            textCounter: (text: string) => {
                const cb = props?.onTextUpdate;
                if (typeof cb === 'function') {
                    cb(Math.ceil(text.length / characterCountLimit * 100));
                }
                return text.length;
            }
        }),
        Placeholder.configure({
            placeholder: props?.placeholder ?? 'Write something...'
        }),
    ];
    const editor = useEditor({
        extensions: extensions,
        content: '',
        editable: props?.editable,
        editorProps: props?.editorProps,
        immediatelyRender: false
    });
    useImperativeHandle(ref, () => {
        return {
            getContent: () => editor?.getHTML(),
            clearEditor: () => editor?.commands.clearContent(true)
        }
    });
    return (
        <div className="flex flex-col gap-1 w-full">
            <EditorContext.Provider value={{editor}}>
                <EditorContent {...props?.containerProps} editor={editor} />
            </EditorContext.Provider>
        </div>
    )
});

export interface PostViewProps {
    content?: string,
    editorProps?: any,
    containerClass?: string,
    isExpanded?: boolean,
    onExpand?: (isExpanded: boolean) => void,
}

export function PostView({ content, editorProps, containerClass, isExpanded = false, onExpand = () => {} }: PostViewProps) {
    const editor = useEditor({
        extensions: viewExtensions,
        content: content,
        editorProps: editorProps,
        editable: false,
        immediatelyRender: false
    });
    const ref = createRef<HTMLDivElement>();
    const isOverflowed = useOverflow(ref, true, () => {});
    function onClick(isExpanded: boolean) {
        onExpand(isExpanded);
    }
    return (
        <div className="flex flex-col gap-1">
            <div className={isExpanded ? '' : 'max-h-[200px] overflow-y-hidden'} ref={ref}>
                <EditorContext.Provider value={{editor}}>
                    <EditorContent className={containerClass} editor={editor} />
                </EditorContext.Provider>
            </div>
            {
                (isOverflowed && !isExpanded) ?
                <Button containerClass="w-fit" variant="ghost" onClick={() => onClick(true)}>Show
                    post...</Button> : null
            }
            {
                (isExpanded) ?
                    <Button containerClass="w-fit" variant="ghost" onClick={() => onClick(false)}>Hide post</Button> : null
            }
        </div>
    );
}