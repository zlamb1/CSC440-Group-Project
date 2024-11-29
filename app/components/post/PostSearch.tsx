import {Input} from "@ui/input";
import {ComponentProps, Dispatch, Fragment, SetStateAction, useEffect, useRef, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import useMountedEffect from "@/utils/hooks/useMountedEffect";
import {formatGenre} from "@/utils/genre-util";
import {Genre} from "@prisma/client";

export type PostSearchProps = Omit<ComponentProps<typeof Input>, 'onChange'> & {
    className?: string;
    value?: string;
    onChange?: (value?: string) => void | Dispatch<SetStateAction<string>>;
};

export default function PostSearch({ className, value, onChange, ...props }: PostSearchProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const ref = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsOpen(isFocused);
    }, [isFocused]);

    const suggestions = [
        {
            placeholder: 'genre::<genre>',
            values: Object.keys(Genre).map(formatGenre)
        },
        {
            placeholder: 'liked::<value>',
            values: [ 'true', 'false', 'null' ]
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

    function prepend() {
        return (
            <Fragment>
                {props?.prepend}
            </Fragment>
        );
    }
    
    function onSuggest(suggestion: string) {
        const index = value?.lastIndexOf?.(suggestion);
        if (!value || index == null) {
            return onChange?.(value + suggestion.replace(/<(.*)>/, ''));
        }
        onChange?.(value + suggestion.substring(value.length - index));
    }

    function SuggestionItems() {
        const attribute = lastAttribute?.split('::')?.[0] + '::';
        const _suggestions = suggestions.filter(suggestion => suggestion.placeholder.startsWith(attribute));

        if (_suggestions.length === 1 && isEnteringValue) {
            const suggestion = _suggestions[0];
            if (suggestion?.values && suggestion.values.length) {
                const values = suggestion.values.filter(value => value.startsWith(lastValue ?? ''));

                if (values.length === 1 && values[0].length === lastValue?.length) {
                    // the attribute is complete
                    return null;
                }

                function onSelectValue(_value: string) {
                    console.log(_value);
                    console.log(lastValue);
                    console.log(value + _value.substring(lastValue?.length ?? 0));
                    onChange?.(value + _value.substring(lastValue?.length ?? 0))
                }

                return (
                    suggestion.values
                        .filter(value => value.startsWith(lastValue ?? ''))
                        .map(value => (
                            <div key={value} className="p-2 text-sm cursor-pointer hover:bg-muted" onClick={() => onSelectValue(value)}>
                                {value}
                            </div>
                        ))
                );
            }
        }

        return (
            _suggestions.map(suggestion => (
                <div key={suggestion.placeholder} className="p-2 text-sm cursor-pointer hover:bg-muted" onClick={() => onSuggest(suggestion.placeholder)}>
                    {suggestion.placeholder}
                </div>
            ))
        );
    }

    return (
        <Popover open={isOpen}>
            <PopoverTrigger asChild>
            <Input {...props}
                       type="text"
                       className={className}
                       prepend={prepend()}
                       value={value}
                       onChange={(e) => onChange?.(e?.target?.value)}
                       onFocus={() => setIsFocused(true)}
                       onBlur={() => setIsFocused(false)}
                       placeholder={isFocused ? '' : 'Search Posts'}
                       ref={ref}
                />
            </PopoverTrigger>
            <PopoverContent ref={popoverRef} className="p-0 flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
                <SuggestionItems />
            </PopoverContent>
        </Popover>
    );
}