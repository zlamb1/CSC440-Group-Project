import {ReactNode, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ui/table";
import Omit from "@ui/omit";
import {Button} from "@ui/button";
import {CaretSortIcon} from "@radix-ui/react-icons";
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

    const { page, setPage, prevPage, nextPage } = usePagination({ pageSize, pageCount });

    function getRows(page: number) {
        const index = page * pageSize;
        const slice = props?.collection?.slice(index, index + pageSize);
        const filterFn = props?.filterFn;
        if (filterFn) {
            return slice?.filter(filterFn);
        }
        return slice;
    }

    const rows = getRows(page);
    const defaultKeyFn = (row: any) => row.id;
    const { selected, selectRow, selectAll, selectedAll } = useSelection({ rows: rows ?? [], keyFn: props?.keyFn ?? defaultKeyFn });

    return { page, pageCount, rows, getRows, prevPage, nextPage, setPage, selected, selectRow, selectAll, selectedAll };
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

function ColumnHead(column: Column) {
    function HeaderContent() {
        if (column?.displayName) {
            return column.displayName;
        } else {
            return column.name.substring(0, 1).toUpperCase() + column.name.substring(1).toLowerCase();
        }
    }

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

    return (
        <Omit key={column.name} omit={column?.hidden}>
            <TableHead>
                {
                    column.sortable ?
                        <Button containerClass={`flex ${getJustify()}`} variant="ghost">
                            { HeaderContent() }
                            <CaretSortIcon />
                        </Button> :
                        <span className={getMargin()}>{ HeaderContent() }</span>
                }
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

    return (
        <Omit key={column.name} omit={column?.hidden}>
            <TableCell className={getTextAlign()} key={column.name}>
                { column.formatFn ? column.formatFn(value) : value }
            </TableCell>
        </Omit>
    );
}

export default function DataTable({ columns, data = [], pageSize = 5, usePagination = true,
                                      useSelection = true, keyFn = (row => row.id), filterFn }: DataTableProps) {
    const table = useTable({
        collection: data,
        pageSize,
        filterFn: filterFn,
        keyFn: keyFn
    });

    const {selected, rows, selectRow, selectAll, selectedAll} = table;
    const isEmpty = !rows || !rows.length || rows.length === 0;

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
                        { columns.map(ColumnHead) }
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