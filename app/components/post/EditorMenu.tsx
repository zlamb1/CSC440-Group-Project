import {Editor} from "@tiptap/react";
import {Button} from "@ui/button";
import {
  CaretSortIcon,
  CheckIcon,
  FontBoldIcon,
  FontFamilyIcon,
  FontItalicIcon,
  FontSizeIcon,
  StrikethroughIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  UnderlineIcon
} from "@radix-ui/react-icons";
import React, {ReactNode, useRef} from "react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";
import {Card} from "@ui/card";
import {cn} from "@/lib/utils";
import {DropdownMenu} from "@radix-ui/react-dropdown-menu";
import {DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger} from "@ui/dropdown-menu";
import Expand from "@ui/expand";
import {Palette} from "lucide-react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const fonts = [
    'Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Helvetica', 'Times New Roman', 'Georgia', 'Inter', 'Comic Sans', 'Serif', 'Cursive', 'Monospace',
  ];

  const attributes = editor?.getAttributes('textStyle');
  const fontFamily = attributes?.fontFamily;
  const fontSize = attributes?.fontSize;
  const textColor = attributes?.color;

  function setFontSize(_fontSize: string) {
    if (fontSize === _fontSize) {
      editor?.chain().focus().unsetFontSize().run();
    } else {
      editor?.chain().focus().setFontSize(_fontSize).run();
    }
  }

  function setFontFamily(_fontFamily: string) {
    if (fontFamily === _fontFamily) {
      editor?.chain().focus().unsetFontFamily().run();
    } else {
      editor?.chain().focus().setFontFamily(_fontFamily).run();
    }
  }

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
      <MarkSuggestion mark="Text Color">
        <div className="flex items-cente  r gap-1">
          <Button className="bg-transparent flex gap-2 w-fit h-7 p-1" variant="outline" size="icon" type="button"
                  onClick={() => inputRef.current?.click()}>
            <Palette className="w-4 h-4"/>
            {textColor && <div className="w-3 h-3 rounded-full" style={{background: textColor}}/>}
          </Button>
          <input onInput={(evt) => editor?.chain().focus().setColor(evt.target.value).run()} value={textColor ?? ''}
                 className="hidden" ref={inputRef}
                 type="color"/>
        </div>
      </MarkSuggestion>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-transparent w-fit h-7 flex gap-3 px-2" size="icon" type="button">
            <FontSizeIcon/>
            <Expand className="overflow-x-hidden" horizontal show={!!fontSize}>
              {fontSize}
            </Expand>
            <CaretSortIcon className="h-4 w-4 opacity-50"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            {
              Array.from(Array(24).keys()).map(i => (i + 1) * 2).map(_fontSize =>
                <DropdownMenuItem className="flex justify-between cursor-pointer" key={_fontSize}
                                  onClick={() => setFontSize(_fontSize + 'px')}>
                  {_fontSize}px
                  {fontSize === _fontSize + 'px' && <CheckIcon className="h-4 w-4"/>}
                </DropdownMenuItem>
              )
            }
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-transparent w-fit h-7 flex gap-3 px-2" size="icon" type="button">
            <FontFamilyIcon/>
            <Expand className="overflow-x-hidden" horizontal show={!!fontFamily}>
              {fontFamily}
            </Expand>
            <CaretSortIcon className="h-4 w-4 opacity-50"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            {
              fonts.map(_fontFamily =>
                <DropdownMenuItem key={_fontFamily}
                                  className="flex justify-between cursor-pointer"
                                  onClick={() => setFontFamily(_fontFamily)}
                >
                  {_fontFamily}
                  {fontFamily === _fontFamily && <CheckIcon className="h-4 w-4"/>}
                </DropdownMenuItem>
              )
            }
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  )
}