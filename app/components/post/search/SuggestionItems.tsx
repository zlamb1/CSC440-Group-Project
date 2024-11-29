import {Dispatch, forwardRef, SetStateAction, useEffect} from "react";
import {Genre} from "@prisma/client";
import {formatGenre} from "@/utils/genre-util";
import {cn} from "@/lib/utils";

export interface SuggestionItemsProps {
  value?: string;
  selectionIndex?: number;
  onChange?: (value?: string) => void | Dispatch<SetStateAction<string>>;
  setMaxSelection?: Dispatch<SetStateAction<number>>;
}

export const SuggestionItems = forwardRef<HTMLDivElement, SuggestionItemsProps>(({
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
        onChange?.(value + _value.substring(lastValue?.length ?? 0))
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