import {ReactNode, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import {Button, buttonVariants} from "@ui/button";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {cn} from "@/lib/utils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@ui/select";

export interface DatePickerProps {
    children: ReactNode;
    value?: Date;
    onChangeValue?: (value: Date) => void;
    disabled?: (date: Date) => boolean;
    fromYear?: number;
    toYear?: number;
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

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

export default function DatePicker({ children, value, onChangeValue, disabled, fromYear, toYear }: DatePickerProps) {
    const [date, setDate] = useState<Date>(value ?? new Date());

    const firstDayOfMonth = getFirstDayOfMonth(date);
    const month = date?.getMonth();
    const monthString = date?.toLocaleString('default', { month: 'long' });
    const fullYear = date?.getFullYear();

    const renderYearSelect = fromYear != null && toYear != null;
    const years = mapArray(fromYear ?? 0, toYear ?? 0);

    const days = [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ];

    const navBtnClasses = cn(
        buttonVariants({ variant: "outline" }),
        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-[0.5rem]"
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
        setDate(prev => {
            const date = new Date(prev.getTime());
            date.setMonth(months.indexOf(month));
            return date;
        })
    }

    function onChangeYear(year: string) {
        setDate(prev => {
            const date = new Date(prev.getTime());
            date.setFullYear(parseInt(year));
            return date;
        });
    }

    function cmpDateWithValue(_date: Date) {
        return _date.getDate() === value?.getDate?.() && _date.getMonth() === value?.getMonth?.() && _date.getFullYear() === value?.getFullYear?.();
    }

    function isToday(_date: Date) {
        const today = new Date();
        return today.getDate() === _date?.getDate?.() && today.getMonth() === _date?.getMonth?.() && today.getFullYear() === _date?.getFullYear?.();
    }

    return (
        <Popover modal>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Button className={navBtnClasses} onClick={onPrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1 text-sm font-medium">
                        <Select defaultValue={monthString} onValueChange={onChangeMonth}>
                            <SelectTrigger className="border-0 hover:bg-accent">
                                <SelectValue placeholder={monthString}>{monthString}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    months.map(_month => {
                                        return (
                                            <SelectItem key={_month} value={_month}>
                                                {_month}
                                            </SelectItem>
                                        )
                                    })
                                }
                            </SelectContent>
                        </Select>
                        {
                            renderYearSelect ? (
                                <Select defaultValue={fullYear?.toString()} onValueChange={onChangeYear}>
                                    <SelectTrigger className="border-0 hover:bg-accent">
                                        <SelectValue placeholder={fullYear}>{fullYear}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            years.map(_year =>
                                                <SelectItem key={_year} value={_year?.toString()}>
                                                    {_year}
                                                </SelectItem>
                                            )
                                        }
                                    </SelectContent>
                                </Select>
                            ) : <span className="flex items-center">{fullYear}</span>
                        }
                    </div>
                    <Button className={navBtnClasses} onClick={onNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="w-full flex justify-between">
                    {
                        days.map((day, index) => {
                                const _date = new Date(firstDayOfMonth.getTime());
                                _date.setDate(_date.getDate() + index);
                                return (
                                    <div key={day} className="flex flex-col gap-1 items-center">
                                        <span className="text-muted-foreground text-center rounded-md w-9 font-normal text-[0.8rem]">
                                            {day}
                                        </span>
                                        {
                                            [0, 1, 2, 3, 4].map(i => {
                                                const __date = new Date(_date.getTime());
                                                __date.setDate(__date.getDate() + 7 * i);
                                                const outside = __date.getMonth() !== month;
                                                const _disabled = disabled?.(__date) ?? false;
                                                const className = cn('h-8 w-8 p-0 rounded-[0.6rem] font-normal aria-selected:opacity-100',
                                                    cmpDateWithValue(__date) && selectedBtnClasses,
                                                    isToday(__date) && todayBtnClasses,
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
                            }
                        )
                    }
                </div>
            </PopoverContent>
        </Popover>
    );
}