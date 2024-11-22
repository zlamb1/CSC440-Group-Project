import {ReactNode, useRef, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import {Button, buttonVariants} from "@ui/button";
import {ChevronDown, ChevronLeft, ChevronRight, ChevronUp} from "lucide-react";
import {cn} from "@/lib/utils";

export interface DatePickerProps {
    children: ReactNode;
    className?: string;
    value?: string | Date | null;
    onChangeValue?: (value: Date) => void;
    disabled?: (date: Date) => boolean;
    fromYear?: number;
    toYear?: number;
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

function parseValue(value?: string | Date | null) {
    if (!value) {
        return null;
    }

    switch (typeof value) {
        case 'number':
        case 'string':
            return new Date(value);
        case 'object':
            return value;
        default:
            return null;
    }
}

function getFirstDayOfMonth(date: Date) {
    const newDate = new Date(date.getTime());
    newDate.setDate(1);
    return newDate;
}

/**
 *
 * @param start (inclusive)
 * @param end   (inclusive)
 */
function mapArray(start: number, end: number) {
    const array = [];
    for (let i = start; i <= end; i++) {
        array.push(i);
    }
    return array;
}

function getMonthMode({ onChangeMonth }: { onChangeMonth?: (month: string) => void }) {
    return (
        <div className="w-full flex gap-1 justify-between">
            {
                [0, 1, 2].map(i =>
                    <div key={i} className="flex flex-col gap-1">
                        {
                            [0, 1, 2, 3].map(j =>
                                <Button key={j}
                                        containerClass="w-full"
                                        className="w-full bg-transparent"
                                        variant="outline"
                                        onClick={() => onChangeMonth?.(months[i + j * 3])}
                                >
                                    {months[i + j * 3]}
                                </Button>
                            )
                        }
                    </div>
                )
            }
        </div>
    );
}

function getYearMode({ fromYear, toYear, onChangeYear }: { fromYear: number; toYear: number, onChangeYear?: (year: number) => void }) {
    const years = mapArray(fromYear ?? 0, toYear ?? 0).reverse();

    return (
        <div className="h-[212px] overflow-y-scroll">
            <div className="grid grid-cols-4">
                {
                    years.map(year =>
                        <Button className="bg-transparent" variant="ghost" onClick={() => onChangeYear?.(year)}>
                            {year}
                        </Button>
                    )
                }
            </div>
        </div>
    );
}

export default function DatePicker({ children, className, value, onChangeValue, disabled, fromYear, toYear }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [mode, setMode] = useState<number>(0);
    const _value = parseValue(value);
    const [date, setDate] = useState<Date>(_value ?? new Date());
    const ref = useRef<HTMLDivElement>(null);

    const firstDayOfMonth = getFirstDayOfMonth(date);
    const month = date?.getMonth();
    const monthString = date?.toLocaleString('default', { month: 'long' });
    const fullYear = date?.getFullYear();

    const renderYearSelect = fromYear != null && toYear != null;

    const days = [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ];

    const navBtnClasses = cn(
        buttonVariants({ variant: "outline" }),
        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
    );

    const todayBtnClasses = 'bg-accent text-accent-foreground';
    const selectedBtnClasses = 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground';
    const outsideBtnClasses = 'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground';
    const disabledBtnClasses = 'text-muted-foreground opacity-50';

    function onPrev() {
        setDate(prev => {
            const date = new Date(prev.getTime());
            date.setMonth(date.getMonth() - 1);
            return date;
        });
    }

    function onNext() {
        setDate(prev => {
            const date = new Date(prev.getTime());
            date.setMonth(date.getMonth() + 1);
            return date;
        });
    }

    function onChangeMonth(month: string) {
        setMode(0);
        setDate(prev => {
            const date = new Date(prev.getTime());
            date.setMonth(months.indexOf(month));
            return date;
        });
    }

    function onChangeYear(year: number) {
        setMode(0);
        setDate(prev => {
            const date = new Date(prev.getTime());
            date.setFullYear(year);
            return date;
        });
    }

    function cmpDateWithValue(_date: Date) {
        return _date.getDate() === _value?.getDate?.() && _date.getMonth() === _value?.getMonth?.() && _date.getFullYear() === _value?.getFullYear?.();
    }

    function isToday(_date: Date) {
        const today = new Date();
        return today.getDate() === _date?.getDate?.() && today.getMonth() === _date?.getMonth?.() && today.getFullYear() === _date?.getFullYear?.();
    }

    function getDayMode() {
        return (
            <div className="w-full flex gap-1 justify-between">
                {
                    days.map((day, index) => {
                        const _date = new Date(firstDayOfMonth.getTime());
                        _date.setDate(_date.getDate() + index);
                        return (
                            <div key={day} className="flex flex-col gap-1 items-center">
                                <span
                                    className="text-muted-foreground text-center rounded-md w-9 font-normal text-[0.8rem]">
                                    {day}
                                </span>
                                {
                                    [0, 1, 2, 3, 4].map(i => {
                                        const __date = new Date(_date.getTime());
                                        __date.setDate(__date.getDate() + 7 * i);
                                        const outside = __date.getMonth() !== month;
                                        const _disabled = disabled?.(__date) ?? false;
                                        const className = cn('h-8 w-8 p-0 font-normal aria-selected:opacity-100',
                                            isToday(__date) && todayBtnClasses,
                                            cmpDateWithValue(__date) && selectedBtnClasses,
                                            outside && outsideBtnClasses,
                                            _disabled && disabledBtnClasses
                                        );
                                        return (
                                            <Button key={i}
                                                    className={className}
                                                    variant="ghost"
                                                    onClick={() => onChangeValue?.(__date)}
                                                    disabled={_disabled}
                                            >
                                                {__date.getDate()}
                                            </Button>
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        );
    }

    function renderMode() {
        switch (mode) {
            case 0:
                return getDayMode();
            case 1:
                return getMonthMode({ onChangeMonth });
            case 2:
                return getYearMode({ fromYear: fromYear || 0, toYear: toYear || 0, onChangeYear });
            default:
                return null;
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent ref={ref} className={cn("flex flex-col gap-2 min-w-[335px]", className)}>
                <div className="flex items-center justify-between">
                    <Button className={navBtnClasses} onClick={onPrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1 text-sm font-medium">
                        <Button className="flex gap-1 hover:bg-accent" variant="ghost" onClick={() => setMode(prev => prev === 1 ? 0 : 1)}>
                            {monthString}
                            { mode === 1 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" /> }
                        </Button>
                        {
                            renderYearSelect ? (
                                <Button className="flex gap-1 hover:bg-accent" variant="ghost" onClick={() => setMode(prev => prev === 2 ? 0 : 2)}>
                                    {fullYear}
                                    { mode === 2 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" /> }
                                </Button>
                            ) : <span className="flex items-center">{fullYear}</span>
                        }
                    </div>
                    <Button className={navBtnClasses} onClick={onNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
                { renderMode() }
            </PopoverContent>
        </Popover>
    );
}