import {BubbleMenu, Editor} from "@tiptap/react";
import {Card} from "@ui/card";
import {Button} from "@ui/button";
import {FontBoldIcon, FontItalicIcon, StrikethroughIcon, UnderlineIcon} from "@radix-ui/react-icons";
import React, {ReactNode} from "react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";

function MarkSuggestion({children, mark, bind}: { children: ReactNode, mark: string, bind?: string }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="px-3 py-1 size-fit text-xs flex flex-col">
        <span>{mark}</span>
        {bind && <span className="text-muted-foreground text-[0.5rem]">{bind}</span>}
      </HoverCardContent>
    </HoverCard>
  );
}

export default function EditorBubbleMenu({editor}: { editor: Editor | null }) {
  return (
    <BubbleMenu editor={editor} tippyOptions={{duration: 100, appendTo: document.body}}>
      <Card className="flex items-center gap-1 p-1">
        <MarkSuggestion mark="Bold" bind="(CTRL + B)">
          <Button variant={editor?.isActive('bold') ? 'default' : 'ghost'} size="icon"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className="w-8 h-8"
                  type="button">
            <FontBoldIcon/>
          </Button>
        </MarkSuggestion>
        <MarkSuggestion mark="Italic" bind="(CTRL + I)">
          <Button variant={editor?.isActive('italic') ? 'default' : 'ghost'} size="icon"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className="w-8 h-8"
                  type="button">
            <FontItalicIcon/>
          </Button>
        </MarkSuggestion>
        <MarkSuggestion mark="Underline" bind="(CTRL + U)">
          <Button variant={editor?.isActive('underline') ? 'default' : 'ghost'} size="icon"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className="w-8 h-8"
                  type="button">
            <UnderlineIcon/>
          </Button>
        </MarkSuggestion>
        <MarkSuggestion mark="Strikethrough" bind="(CTRL + SHIFT + S)">
          <Button variant={editor?.isActive('strike') ? 'default' : 'ghost'} size="icon"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className="w-8 h-8"
                  type="button">
            <StrikethroughIcon/>
          </Button>
        </MarkSuggestion>
      </Card>
    </BubbleMenu>
  )
}