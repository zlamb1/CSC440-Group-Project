import {
    EditorContent,
    EditorProvider,
} from "@tiptap/react";

import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import {Youtube} from "@tiptap/extension-youtube";
import {all, createLowlight} from "lowlight";
import {CodeBlockLowlight} from "@tiptap/extension-code-block-lowlight";
import React, {useImperativeHandle, useState} from "react";
import {CharacterCount} from "@tiptap/extension-character-count";
import {Placeholder} from "@tiptap/extension-placeholder";

const lowlight = createLowlight(all);

const editorExtensions = [
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
        limit: 300
    }),
    Placeholder.configure({
        placeholder: 'Write something...'
    }),
]

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
        limit: 300
    }),
]

export interface PostEditorElement {
    getContent: () => string;
}

export const PostEditor = React.forwardRef((props: any, ref) => {
    const [ content, setContent ] = useState('');
    useImperativeHandle(ref, () => {
        return {
            getContent: () => content
        }
    });
    return (
        <EditorProvider onUpdate={(evt) => setContent(evt.editor.getHTML())}
                        extensions={editorExtensions}
                        content={content}
                        editorContainerProps={props?.containerProps}
                        immediatelyRender={false}>
            <EditorContent editor={null} />
        </EditorProvider>
    )
});

export function PostView({ content, containerProps }: { content: any, containerProps?: any }) {
    return (
        <EditorProvider extensions={viewExtensions}
                        content={content}
                        editable={false}
                        editorContainerProps={containerProps}
                        immediatelyRender={false}>
            <EditorContent editor={null} />
        </EditorProvider>
    );
}