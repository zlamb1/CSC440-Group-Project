import {Input} from "@ui/input";
import {ComponentProps, Dispatch, Fragment, KeyboardEvent, SetStateAction, useEffect, useRef, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import {SuggestionItems} from "@components/post/search/SuggestionItems";

export type PostSearchProps = Omit<ComponentProps<typeof Input>, 'onChange'> & {
  className?: string;
  value?: string;
  onChange?: (value?: string) => void | Dispatch<SetStateAction<string>>;
};

export default function PostSearch({className, value, onChange, ...props}: PostSearchProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [selectionIndex, setSelectionIndex] = useState<number>(0);
  const [maxSelection, setMaxSelection] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectionIndex(0);
  }, [value, isOpen]);

  function prepend() {
    return (
      <Fragment>
        {props?.prepend}
      </Fragment>
    );
  }

  function onKeyDown(evt: KeyboardEvent) {
    const key = evt.key.toLowerCase();
    switch (key) {
      case 'enter':
        selectedRef.current?.click?.();
        break;
      case 'arrowdown':
        evt.preventDefault();
        setSelectionIndex(prev => Math.min(prev + 1, maxSelection - 1));
        break;
      case 'arrowup':
        evt.preventDefault();
        setSelectionIndex(prev => Math.max(prev - 1, 0));
        break;
    }
  }

  return (
    <Popover open={isOpen || isFocused} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Input {...props}
               type="text"
               className={className}
               prepend={prepend()}
               value={value}
               onChange={(e) => onChange?.(e?.target?.value)}
               onKeyDown={onKeyDown}
               onFocus={() => setIsFocused(true)}
               onBlur={() => setIsFocused(false)}
               placeholder={'Search Posts'}
               ref={inputRef}
        />
      </PopoverTrigger>
      <PopoverContent ref={popoverRef} className="p-0 flex flex-col"
                      onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SuggestionItems value={value} selectionIndex={selectionIndex} onChange={onChange}
                         setMaxSelection={setMaxSelection} ref={selectedRef}
        />
      </PopoverContent>
    </Popover>
  );
}