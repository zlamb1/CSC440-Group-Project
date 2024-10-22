import {ReactNode, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ui/table";
import Omit from "@ui/omit";
import {Button} from "@ui/button";
import {CaretDownIcon, CaretSortIcon, CaretUpIcon} from "@radix-ui/react-icons";
import {Checkbox} from "@ui/checkbox";
import {useTable} from "@components/table/table";
import {cn} from "@/lib/utils";

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

export interface SlotProps {
    page: number;
    pageCount: number;
    prevPage: () => void;
    nextPage: () => void;
    rows?: any[];
    selected?: any[];
}

export type Slot = ((props: SlotProps) => ReactNode) | ReactNode;

export interface DataTableProps {
    columns: Column[];
    data?: any;
    className?: string;
    pageSize?: number;
    usePagination?: boolean;
    useSelection?: boolean;
    keyFn?: (row: any) => any;
    filterFn?: (row: any) => boolean;
    prepend?: Slot;
    append?: Slot;
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

export default function DataTable({ columns, data = [], pageSize = 5, usePagination = true, className,
                                    useSelection = true, keyFn = (row => row.id), filterFn, prepend, append
                                  }: DataTableProps)
{
    const table = useTable({
        collection: data,
        filterFn:   filterFn,
        keyFn:      keyFn,
        pageSize,
    });

    const {
            page, pageCount, prevPage, nextPage, rows, selected, selectRow, selectAll, selectedAll,
            sortedBy, setSorted, isSortedDescending, setSortedDescending,
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

    function getSlot(slot: Slot) {
        if (typeof slot === 'function') {
            return slot({ page, pageCount, prevPage, nextPage, rows, selected });
        } else if (slot) {
            return slot;
        } else {
            return null;
        }
    }

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {
                getSlot(prepend)
            }
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
                            <TableCell className="text-center">
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
            {
                getSlot(append)
            }
        </div>
    )
}