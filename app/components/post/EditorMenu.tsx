import {Editor} from "@tiptap/react";
import {Button} from "@ui/button";
import {
  FontBoldIcon,
  FontFamilyIcon,
  FontItalicIcon,
  StrikethroughIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  UnderlineIcon
} from "@radix-ui/react-icons";
import React, {ReactNode} from "react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";
import {Card} from "@ui/card";
import {cn} from "@/lib/utils";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger} from "@ui/select";

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

  const attributes = editor?.getAttributes('textStyle');
  const fontFamily = attributes?.fontFamily;

  return (
    <Card className={cn('flex gap-1 items-center', className)}>
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
      <MarkSuggestion mark="Text Align Left" bind="(CTRL + SHIFT + L)">
        <Button variant={editor?.isActive({textAlign: 'left'}) ? 'default' : 'ghost'} size="icon"
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                className="w-7 h-7"
                type="button">
          <TextAlignLeftIcon/>
        </Button>
      </MarkSuggestion>
      <MarkSuggestion mark="Text Align Center" bind="(CTRL + SHIFT + E)">
        <Button variant={editor?.isActive({textAlign: 'center'}) ? 'default' : 'ghost'} size="icon"
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                className="w-7 h-7"
                type="button">
          <TextAlignCenterIcon/>
        </Button>
      </MarkSuggestion>
      <MarkSuggestion mark="Text Align Right" bind="(CTRL + SHIFT + R)">
        <Button variant={editor?.isActive({textAlign: 'right'}) ? 'default' : 'ghost'} size="icon"
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                className="w-7 h-7"
                type="button">
          <TextAlignRightIcon/>
        </Button>
      </MarkSuggestion>
      <MarkSuggestion mark="Text Align Justify" bind="(CTRL + SHIFT + R)">
        <Button variant={editor?.isActive({textAlign: 'justify'}) ? 'default' : 'ghost'} size="icon"
                onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                className="w-7 h-7"
                type="button">
          <TextAlignJustifyIcon/>
        </Button>
      </MarkSuggestion>
      <Select value={fontFamily} onValueChange={(font) => editor?.chain().focus().setFontFamily(font).run()}>
        <SelectTrigger className="w-fit h-7 flex gap-3">
          <FontFamilyIcon/>
          {fontFamily ? fontFamily : null}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {
              fonts.map(font =>
                <SelectItem key={font}
                            className="cursor-pointer"
                            value={font}
                >
                  {font}
                </SelectItem>
              )
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    </Card>
  )
}