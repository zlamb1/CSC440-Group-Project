import {Input} from "@ui/input";
import {
  ComponentProps,
  Dispatch,
  forwardRef,
  Fragment,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import {formatGenre} from "@/utils/genre-util";
import {Genre} from "@prisma/client";
import {cn} from "@/lib/utils";

interface SuggestionItemsProps {
  value?: string;
  selectionIndex?: number;
  onChange?: (value?: string) => void | Dispatch<SetStateAction<string>>;
  setMaxSelection?: Dispatch<SetStateAction<number>>;
}

const SuggestionItems = forwardRef<HTMLDivElement, SuggestionItemsProps>(({
                                                                            value,
                                                                            selectionIndex,
                                                                            onChange,
                                                                            setMaxSelection
                                                                          }: SuggestionItemsProps, ref) => {
  const suggestions = [
    {
      placeholder: 'genre::<genre>',
      values: Object.keys(Genre).map(formatGenre)
    },
    {
      placeholder: 'liked::<value>',
      values: ['true', 'false', 'null']
    },
    {
      placeholder: 'likes::<number>'
    },
    {
      placeholder: 'replies::<number>',
    }
  ];

  const attributes = value?.split(' ');
  const lastAttribute = attributes?.[attributes?.length - 1];
  const lastValue = lastAttribute?.split('::')?.[1];
  const regex = /(.*)::/;
  const isEnteringValue = regex.test(lastAttribute ?? '');
  const attribute = lastAttribute?.split('::')?.[0];
  const _suggestions = suggestions.filter(suggestion => suggestion.placeholder.startsWith(attribute ?? ''));

  useEffect(() => {
    if (_suggestions.length === 1 && isEnteringValue) {
      const suggestion = _suggestions[0];
      if (suggestion?.values && suggestion.values.length) {
        const values = suggestion.values.filter(value => value.startsWith(lastValue ?? ''));
        if (values.length === 1 && values[0].length === lastValue?.length) {
          setMaxSelection?.(0);
        } else {
          setMaxSelection?.(values.length);
        }
      }
    } else {
      setMaxSelection?.(_suggestions.length);
    }
  }, [value]);

  function onSuggest(suggestion: string) {
    const index = value?.lastIndexOf?.(suggestion);
    if (!value || index == null) {
      return onChange?.(value + suggestion.replace(/<(.*)>/, ''));
    }
    onChange?.(value + suggestion.substring(value.length - index));
  }

  if (_suggestions.length === 1 && isEnteringValue) {
    const suggestion = _suggestions[0];
    if (suggestion?.values && suggestion.values.length) {
      const values = suggestion.values.filter(value => value.startsWith(lastValue ?? ''));

      if (values.length === 1 && values[0].length === lastValue?.length) {
        // the attribute is complete
        return null;
      }

      function onSelectValue(_value: string) {
        //onChange?.(value + _value.substring(lastValue?.length ?? 0))
      }

      return (
        values
          .map((value, i) => (
            <div key={value}
                 className={cn("p-2 text-sm cursor-pointer hover:bg-muted", i === selectionIndex && 'bg-muted')}
                 onClick={() => onSelectValue(value)}
                 ref={i === selectionIndex ? ref : undefined}
            >
              {value}
            </div>
          ))
      );
    }
  }

  return (
    _suggestions.map((suggestion, i) => (
      <div key={suggestion.placeholder}
           className={cn("p-2 text-sm cursor-pointer hover:bg-muted", i === selectionIndex && 'bg-muted')}
           onClick={() => onSuggest(suggestion.placeholder)}
           ref={i === selectionIndex ? ref : undefined}
      >
        {suggestion.placeholder}
      </div>
    ))
  );
});

export type PostSearchProps = Omit<ComponentProps<typeof Input>, 'onChange'> & {
  className?: string;
  value?: string;
  onChange?: (value?: string) => void | Dispatch<SetStateAction<string>>;
};

export default function PostSearch({className, value, onChange, ...props}: PostSearchProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectionIndex, setSelectionIndex] = useState<number>(0);
  const [maxSelection, setMaxSelection] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectionIndex(0);
    setMaxSelection(0);
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Input {...props}
               type="text"
               className={className}
               prepend={prepend()}
               value={value}
               onChange={(e) => onChange?.(e?.target?.value)}
               onKeyDown={onKeyDown}
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