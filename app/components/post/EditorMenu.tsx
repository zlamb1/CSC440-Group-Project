import {Editor} from "@tiptap/react";
import {Button} from "@ui/button";
import {FontBoldIcon, FontFamilyIcon, FontItalicIcon, StrikethroughIcon, UnderlineIcon} from "@radix-ui/react-icons";
import React, {ReactNode} from "react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";
import {Card} from "@ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@ui/dropdown-menu";
import {cn} from "@/lib/utils";

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

export default function EditorMenu({editor, className}: { editor: Editor | null, className?: string }) {
  const fonts = [
    'Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Helvetica', 'Times New Roman', 'Georgia'
  ];

  return (
    <Card className={cn('flex items-center', className)}>
      <MarkSuggestion mark="Bold" bind="(CTRL + B)">
        <Button variant={editor?.isActive('bold') ? 'default' : 'ghost'} size="icon"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className="w-7 h-7"
                type="button">
          <FontBoldIcon/>
        </Button>
      </MarkSuggestion>
      <MarkSuggestion mark="Italic" bind="(CTRL + I)">
        <Button variant={editor?.isActive('italic') ? 'default' : 'ghost'} size="icon"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className="w-7 h-7"
                type="button">
          <FontItalicIcon/>
        </Button>
      </MarkSuggestion>
      <MarkSuggestion mark="Underline" bind="(CTRL + U)">
        <Button variant={editor?.isActive('underline') ? 'default' : 'ghost'} size="icon"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className="w-7 h-7"
                type="button">
          <UnderlineIcon/>
        </Button>
      </MarkSuggestion>
      <MarkSuggestion mark="Strikethrough" bind="(CTRL + SHIFT + S)">
        <Button variant={editor?.isActive('strike') ? 'default' : 'ghost'} size="icon"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                className="w-7 h-7"
                type="button">
          <StrikethroughIcon/>
        </Button>
      </MarkSuggestion>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer w-7 h-7 overflow-auto p-0" variant="ghost" type="button">
            <FontFamilyIcon/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {
            fonts.map(font =>
              <DropdownMenuItem key={font} className="cursor-pointer">
                {font}
              </DropdownMenuItem>
            )
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  )
}