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

const lowlight = createLowlight(all);
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
        limit: 300
    }),
];

const defaultContent = '<pre><code class="language-javascript">for (var i=1; i <= 20; i++)\n' +
    '{\n' +
    '  if (i % 15 == 0)\n' +
    '    console.log("FizzBuzz");\n' +
    '  else if (i % 3 == 0)\n' +
    '    console.log("Fizz");\n' +
    '  else if (i % 5 == 0)\n' +
    '    console.log("Buzz");\n' +
    '  else\n' +
    '    console.log(i);\n' +
    '}</code></pre>';

export interface PostEditorElement {
    getContent: () => string;
}

export const PostEditor = React.forwardRef((props: any, ref) => {
    const [ content, setContent ] = useState(defaultContent);
    useImperativeHandle(ref, () => {
        return {
            getContent: () => content
        }
    });
    return (
        <EditorProvider onUpdate={(evt) => setContent(evt.editor.getHTML())}
                        extensions={extensions}
                        content={content}
                        editorContainerProps={props?.containerProps}
                        immediatelyRender={false}>
            <EditorContent editor={null} />
        </EditorProvider>
    )
});

export const PostView = React.forwardRef((props: any, ref) => {
    const [ content, setContent ] = useState(defaultContent);
    useImperativeHandle(ref, () => {
        return {
            getContent: () => content
        }
    });
    return (
        <EditorProvider onUpdate={(evt) => setContent(evt.editor.getHTML())}
                        extensions={extensions}
                        content={props.content}
                        editable={false}
                        editorContainerProps={props?.containerProps}
                        immediatelyRender={false}>
            <EditorContent editor={null} />
        </EditorProvider>
    )
});