import {useEffect, useState} from "react";

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

    return { selected, setSelected, selectRow, selectAll, selectedAll }
}

export function useTable(props?: { collection?: any[], pageSize?: number, filter?: any, filterFn?: (row: any) => boolean, keyFn?: (row: any) => any }) {
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

    function getRowsByPage(page: number) {
        if (!props?.collection) {
            return [];
        }

        const index = page * pageSize;
        let slice = props.collection?.slice?.(index, index + pageSize);
        const filterFn = props?.filterFn;
        if (filterFn) {
            slice = slice?.filter?.(filterFn);
        }
        if (sortedBy) {
            slice?.sort?.(defaultSort);
        }
        return slice;
    }

    const [ rows, setRows ] = useState<any[]>(getRowsByPage(page));

    useEffect(() => {
        setRows(getRowsByPage(page));
    }, [page, props?.filter, sortedBy, isSortedDescending]);

    const defaultKeyFn = (row: any) => row.id;
    const { selected, setSelected, selectRow, selectAll, selectedAll } = useSelection({ rows: rows ?? [], keyFn: props?.keyFn ?? defaultKeyFn });

    useEffect(() => {
        setSelected([]);
    }, [page]);

    return { page, pageCount, rows, setRows, getRowsByPage, prevPage, nextPage, setPage,
        selected, selectRow, selectAll, selectedAll, sortedBy, setSorted,
        isSortedDescending, setSortedDescending
    };
}