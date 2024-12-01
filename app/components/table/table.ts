import {Dispatch, SetStateAction, useEffect, useState} from "react";

export function usePagination(props?: { pageSize?: number, pageCount?: number }) {
  const [page, setPage] = useState(0);

  function prevPage() {
    return setPage(prev => Math.max(0, prev - 1));
  }

  function nextPage() {
    return setPage(prev => Math.min(prev + 1, (props?.pageCount ?? 1) - 1));
  }

  return {page, setPage, prevPage, nextPage};
}

export type onSelectType = Dispatch<SetStateAction<any[]>>;

export interface UseSelectionProps {
  rows: any[];
  selected?: any[];
  onSelect?: onSelectType;
  keyFn: (row: any) => any;
}

export function useSelection({rows, selected = [], onSelect, keyFn}: UseSelectionProps) {
  const keys = rows?.map(keyFn);
  const selectedAll = keys?.every(key => selected.includes(key));

  function selectRow(row: any) {
    onSelect?.(prev => {
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
    if (selectedAll) {
      onSelect?.([]);
    } else {
      const array: any[] = [];
      for (const row of rows || []) {
        array.push(keyFn(row));
      }
      onSelect?.(array);
    }
  }

  return {selected, selectRow, selectAll, selectedAll}
}

export interface UseTableProps {
  collection?: any[];
  pageSize?: number;
  selected?: any[];
  onSelect?: onSelectType;
  filter?: any;
  filterFn?: (row: any) => boolean;
  keyFn?: (row: any) => any;
}

export function useTable(props?: UseTableProps) {
  const collectionSize = props?.collection?.length ?? 0;
  const pageSize = props?.pageSize ?? 10;
  const pageCount = Math.ceil(collectionSize / pageSize);

  const [sortedBy, setSorted] = useState<string | undefined>();
  const [isSortedDescending, setSortedDescending] = useState<boolean>();

  const {page, setPage, prevPage, nextPage} = usePagination({pageSize, pageCount});

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

  const [rows, setRows] = useState<any[]>(getRowsByPage(page));

  useEffect(() => {
    setRows(getRowsByPage(page));
  }, [page, props?.collection, props?.filter, props?.pageSize, sortedBy, isSortedDescending]);

  const defaultKeyFn = (row: any) => row.id;
  const {selected, selectRow, selectAll, selectedAll} = useSelection({
    rows: rows ?? [], selected: props?.selected ?? [], onSelect: props?.onSelect, keyFn: props?.keyFn ?? defaultKeyFn
  });

  useEffect(() => {
    props?.onSelect?.([]);
  }, [page]);

  return {
    page, pageCount, rows, setRows, getRowsByPage, prevPage, nextPage, setPage,
    selected, selectRow, selectAll, selectedAll, sortedBy, setSorted,
    isSortedDescending, setSortedDescending
  };
}