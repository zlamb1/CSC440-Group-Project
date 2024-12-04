import {BubbleMenu, EditorContent, EditorContext, useEditor,} from "@tiptap/react";

import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import {Youtube} from "@tiptap/extension-youtube";
import {all, createLowlight} from "lowlight";
import {CodeBlockLowlight} from "@tiptap/extension-code-block-lowlight";
import React, {useEffect, useImperativeHandle, useState} from "react";
import {CharacterCount} from "@tiptap/extension-character-count";
import {Placeholder} from "@tiptap/extension-placeholder";
import {Separator} from "@ui/separator";
import useIsSSR from "@/utils/hooks/useIsSSR";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {Card} from "@ui/card";
import {BulletList} from "@tiptap/extension-bullet-list";
import {ListItem} from "@tiptap/extension-list-item";
import {HorizontalRule} from "@tiptap/extension-horizontal-rule";
import {Blockquote} from "@tiptap/extension-blockquote";
import {Button} from "@ui/button";
import {Bold} from "@tiptap/extension-bold";
import {Italic} from "@tiptap/extension-italic";
import {Strike} from "@tiptap/extension-strike";
import {Underline} from "@tiptap/extension-underline";

const lowlight = createLowlight(all);
const characterCountLimit = 32768;

const defaultExtensions = [
  Document,
  Paragraph,
  Text,

  // marks
  Bold,
  Italic,
  Strike,
  Underline,

  Image,
  Dropcursor,
  BulletList.configure({HTMLAttributes: {class: 'tiptap-bullet-list'}}),
  ListItem,
  HorizontalRule,
  Blockquote.configure({HTMLAttributes: {class: 'tiptap-blockquote'}}),
  CodeBlockLowlight.configure({
    lowlight,
  }),
  Youtube.configure({
    controls: false,
    nocookie: true
  }),
];

export interface PostEditorElement {
  getContent: () => string;

  clearEditor(): void;
}

export const PostEditor = React.forwardRef((props: any, ref) => {
  const [isFocused, setFocused] = useState<boolean>(false);
  const isSSR = useIsSSR();

  useEffect(() => {
    setFocused(props?.autofocus);
  }, []);

  useEffect(() => {
    if (typeof props?.focus === 'function' && isFocused) {
      props.focus(isFocused);
    }
  }, [isFocused]);

  const extensions = [
    ...defaultExtensions,
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
      placeholder: props?.placeholder ?? 'Write something...',
    }),
  ];

  const editor = useEditor({
    extensions: extensions,
    content: props?.content,
    editable: props?.editable ?? true,
    editorProps: props?.editorProps,
    immediatelyRender: false,
    autofocus: props?.autofocus ?? false,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  });

  useImperativeHandle(ref, () => {
    return {
      getContent: () => editor?.getHTML(),
      clearEditor: () => editor?.commands.clearContent(true)
    }
  });

  if (isSSR) {
    return (
      <div className="w-full flex flex-col items-center gap-2">
        <LoadingSpinner className="stroke-primary" strokeWidth={3}/>
        <Separator orientation="horizontal"/>
      </div>
    );
  }

  return (
    <Card className="flex flex-col gap-1 w-full px-3 py-1 cursor-text"
          onClick={() => editor?.commands.focus()}>
      <EditorContext.Provider value={{editor}}>
        <BubbleMenu editor={editor} tippyOptions={{duration: 100}}>
          <Card className="flex gap-1">
            <Button variant="ghost" onClick={() => editor?.chain().focus().toggleBold().run()} type="button">
              Bold
            </Button>
            <Button variant="ghost" onClick={() => editor?.chain().focus().toggleItalic().run()} type="button">
              Italic
            </Button>
            <Button variant="ghost" onClick={() => editor?.chain().focus().toggleUnderline().run()} type="button">
              Underline
            </Button>
            <Button variant="ghost" onClick={() => editor?.chain().focus().toggleStrike().run()} type="button">
              Strikethrough
            </Button>
          </Card>
        </BubbleMenu>
        <EditorContent {...props?.containerProps} editor={editor}/>
      </EditorContext.Provider>
      {props?.append}
    </Card>
  );
});