import {EditorContent, EditorContext, useEditor,} from "@tiptap/react";

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
import {Bold} from "@tiptap/extension-bold";
import {Italic} from "@tiptap/extension-italic";
import {Strike} from "@tiptap/extension-strike";
import {Underline} from "@tiptap/extension-underline";
import EditorMenu from "@components/post/EditorMenu";
import Expand from "@ui/expand";
import {FontFamily} from "@tiptap/extension-font-family";
import {TextStyle} from "@tiptap/extension-text-style";
import {TextAlign} from "@tiptap/extension-text-align";
import {Heading} from "@tiptap/extension-heading";
import {Typography} from "@tiptap/extension-typography";
import {FontSize} from "@components/post/editor/font-size";
import {Color} from "@tiptap/extension-color";

const lowlight = createLowlight(all);
const characterCountLimit = 32768;

const defaultExtensions = [
  Document,
  Paragraph,
  Heading,
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

  Typography,
  TextStyle,
  FontFamily,
  FontSize,
  Color,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),

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
    <Card className="flex flex-col gap-1 w-full"
          onClick={() => editor?.commands.focus()}>
      <EditorContext.Provider value={{editor}}>
        <Expand className="w-full flex flex-col overflow-y-hidden" show={props?.isActive}
                initial={false}>
          <EditorMenu className="p-1 bg-transparent border-0 shadow-0" editor={editor}/>
          <Separator/>
        </Expand>
        <div className="flex flex-col gap-1 w-full px-3 py-1 cursor-text">
          <EditorContent {...props?.containerProps} editor={editor}/>
          {props?.append}
        </div>
      </EditorContext.Provider>
    </Card>
  );
});