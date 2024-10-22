import {ReactNode, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ui/table";
import Omit from "@ui/omit";
import {Button} from "@ui/button";
import {CaretDownIcon, CaretSortIcon, CaretUpIcon} from "@radix-ui/react-icons";
import {Checkbox} from "@ui/checkbox";

export function usePagination(props?: { pageSize?: number, pageCount?: number}) {
    const [ page, setPage ] = useState(0);

    function prevPage() {
        return setPage(prev => Math.max(0, prev - 1));
    }

    function nextPage() {
        return setPage(prev => Math.min(prev + 1, (props?.pageCount ?? 1) - 1));
    }

    return { page, setPage, prevPage, nextPage };
}

export function useSelection({ rows, keyFn }: { rows: any[], keyFn: (row: any) => any }) {
    const [ selected, setSelected ] = useState<any[]>([]);

    const keys = rows?.map(keyFn);
    const selectedAll = keys?.every(key => selected.includes(key));

    function selectRow(row: any) {
        setSelected(prev => {
            const array = [...prev];
            const key = keyFn(row);
            const indexOf = prev.indexOf(key);
            if (indexOf > -1) {
                array.splice(indexOf, 1);
            } else {
                array.push(key);
            }
            return array;
        });
    }

    function selectAll() {
        setSelected(() => {
            if (selectedAll) {
                return [];
            } else {
                const array: any[] = [];
                for (const row of rows || []) {
                    array.push(keyFn(row));
                }
                return array;
            }
        });
    }

    return { selected, selectRow, selectAll, selectedAll }
}

export function useTable(props?: { collection?: any[], pageSize?: number, filterFn?: (row: any) => boolean, keyFn?: (row: any) => any }) {
    const collectionSize = props?.collection?.length ?? 0;
    const pageSize = props?.pageSize ?? 10;
    const pageCount = Math.ceil(collectionSize / pageSize);

    const [ sortedBy, setSorted ] = useState<string | undefined>();
    const [ isSortedDescending, setSortedDescending ] = useState<boolean>();

    const { page, setPage, prevPage, nextPage } = usePagination({ pageSize, pageCount });

    const multiplier = isSortedDescending ? -1 : 1;
    function defaultSort(a: any, b: any) {
        if (!sortedBy) {
            return 0;
        }

        const valueA = a[sortedBy];
        const valueB = b[sortedBy];

        switch (typeof valueA) {
            case 'string':
                return valueA.localeCompare(valueB) * multiplier;
            case 'number':
                return (valueA - valueB) * multiplier;
        }

        if (valueA instanceof Date) {
            if (valueA > valueB) {
                return 1 * multiplier;
            } else if (valueA < valueB) {
                return -1 * multiplier;
            } else {
                return 0;
            }
        }

        return (valueA - valueB) * multiplier;
    }

    function getRows(page: number) {
        const index = page * pageSize;
        let slice = props?.collection?.slice(index, index + pageSize);
        const filterFn = props?.filterFn;
        if (filterFn) {
            slice = slice?.filter(filterFn);
        }
        if (sortedBy) {
            slice?.sort(defaultSort);
            console.log(slice);
        }
        return slice;
    }

    const rows = getRows(page);
    const defaultKeyFn = (row: any) => row.id;
    const { selected, selectRow, selectAll, selectedAll } = useSelection({ rows: rows ?? [], keyFn: props?.keyFn ?? defaultKeyFn });

    return { page, pageCount, rows, getRows, prevPage, nextPage, setPage,
             selected, selectRow, selectAll, selectedAll, sortedBy, setSorted,
             isSortedDescending, setSortedDescending
           };
}

export interface Column {
    name: string;
    displayName?: string;
    hidden?: boolean;
    align?: string;
    formatFn?: (col: any) => any;
    header?: ReactNode;
    cell?: ReactNode;
    sortable?: boolean;
}

export interface DataTableProps {
    columns: Column[];
    data?: any;
    pageSize?: number;
    usePagination?: boolean;
    useSelection?: boolean;
    keyFn?: (row: any) => any;
    filterFn?: (row: any) => boolean;
}

function ColumnHead({ column, isSorted = false, isDescending = false, onSort }: { column: Column, isSorted?: boolean, isDescending?: boolean, onSort?: () => void }) {
    function getMargin() {
        switch (column?.align) {
            case 'left':
                return 'mr-auto';
            case 'center':
                return 'mx-auto';
            case 'right':
                return 'ml-auto';
            default:
                return 'mr-auto';
        }
    }

    function getJustify() {
        switch (column?.align) {
            case 'left':
                return 'justify-start';
            case 'center':
                return 'justify-center';
            case 'right':
                return 'justify-end';
            default:
                return 'justify-start';
        }
    }

    function onClick() {
        if (onSort) {
            onSort();
        }
    }

    function getSortIcon() {
        if (!isSorted) {
            return <CaretSortIcon />
        }

        if (isDescending) {
            return <CaretDownIcon />
        } else {
            return <CaretUpIcon />
        }
    }

    function getHeaderCell() {
        const text = (column?.displayName ? column.displayName :
            column.name.substring(0, 1).toUpperCase() + column.name.substring(1).toLowerCase());
        if (column.sortable) {
            return (
                <Button containerClass={`flex ${getJustify()}`} variant="ghost" onClick={ onClick }>
                    { text }
                    { getSortIcon() }
                </Button>
            );
        }
        return (
            <span className={getMargin()}>{ text }</span>
        )
    }

    return (
        <Omit omit={column?.hidden}>
            <TableHead>
                { column?.header ? column.header : getHeaderCell() }
            </TableHead>
        </Omit>

    );
}

function ColumnCell(row: any, column: Column) {
    const value = row[column.name];

    function getTextAlign() {
        switch (column?.align) {
            case 'left':
                return 'text-left';
            case 'center':
                return 'text-center';
            case 'right':
                return 'text-right';
            default:
                return 'text-left';
        }
    }

    function getTableCell() {
        return (
            <TableCell className={getTextAlign()} key={column.name}>
                { column.formatFn ? column.formatFn(value) : value }
            </TableCell>
        );
    }

    return (
        <Omit key={column.name} omit={column?.hidden}>
            {
                column?.cell ? column.cell : getTableCell()
            }
        </Omit>
    );
}

export default function DataTable({ columns, data = [], pageSize = 5, usePagination = true,
                                    useSelection = true, keyFn = (row => row.id), filterFn
                                  }: DataTableProps)
{
    const table = useTable({
        collection: data,
        filterFn:   filterFn,
        keyFn:      keyFn,
        pageSize,
    });

    const {
            selected, rows, selectRow, selectAll, selectedAll,
            sortedBy, setSorted, isSortedDescending, setSortedDescending
    } = table;

    const isEmpty = !rows || !rows.length || rows.length === 0;

    function onSort(name: any) {
        if (name) {
            if (name === sortedBy) {
                if (isSortedDescending) {
                    setSorted(undefined);
                    setSortedDescending(false);
                } else {
                    setSortedDescending(true);
                }
            } else {
                setSorted(name);
                setSortedDescending(false);
            }
        }
    }

    return (
        <Table>
            <Omit omit={isEmpty}>
                <TableHeader>
                    <TableRow>
                        {
                            useSelection ?
                                <TableHead>
                                    <Checkbox checked={selectedAll} onClick={ selectAll } />
                                </TableHead> : null
                        }
                        {
                            columns.map(col =>
                                <ColumnHead key={col.name}
                                            column={col}
                                            isSorted={col.name === sortedBy}
                                            isDescending={isSortedDescending}
                                            onSort={ () => onSort(col.name) }
                                />
                            )
                        }
                    </TableRow>
                </TableHeader>
            </Omit>
            <TableBody>
                <Omit omit={!isEmpty}>
                    <TableRow>
                        <TableCell>
                            No data available. :(
                        </TableCell>
                    </TableRow>
                </Omit>
                {
                    rows?.map(row => (
                        <TableRow key={keyFn(row)}>
                            {
                                useSelection ?
                                    <TableCell>
                                        <Checkbox className="w-4 h-4" checked={selected.includes(keyFn(row))} onClick={ () => selectRow(row) } />
                                    </TableCell> : null
                            }
                            { columns.map(col => ColumnCell(row, col)) }
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}