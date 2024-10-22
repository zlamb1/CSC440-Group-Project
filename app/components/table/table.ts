import {useState} from "react";

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

export default function useTable(props?: { collection?: any[], pageSize?: number, filterFn?: (row: any) => boolean, keyFn?: (row: any) => any }) {
    const collectionSize = props?.collection?.length ?? 0;
    const pageSize = props?.pageSize ?? 10;
    const pageCount = Math.ceil(collectionSize / pageSize);

    const { page, setPage, prevPage, nextPage } = usePagination({ pageSize, pageCount });
    const [ selected, setSelected ] = useState<any[]>([]);

    function defaultKeyFunction(row: any) {
        return row;
    }

    const keyFn = props?.keyFn ?? defaultKeyFunction;

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

    const keys = rows?.map(keyFn);
    const selectedAll = keys?.every(key => selected.includes(key));

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

    return { page, selected, pageCount, rows, getRows, prevPage, nextPage, setPage, selectRow, selectAll, selectedAll };
}