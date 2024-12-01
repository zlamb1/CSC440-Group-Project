import {ReactNode} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ui/table";
import Omit from "@ui/omit";
import {Button} from "@ui/button";
import {CaretDownIcon, CaretSortIcon, CaretUpIcon} from "@radix-ui/react-icons";
import {Checkbox} from "@ui/checkbox";
import {onSelectType, useTable} from "@components/table/table";
import {cn} from "@/lib/utils";
import {AnimatePresence, motion, Reorder} from "framer-motion";

export interface Column {
  name: string;
  displayName?: string;
  hidden?: boolean;
  align?: string;
  formatFn?: (col: any) => any;
  header?: ReactNode;
  cell?: ReactNode | (({row, col}: { row: any, col: Column }) => ReactNode);
  sortable?: boolean;
  suppressHydrationWarning?: boolean;
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
  selected?: any[];
  onSelect?: onSelectType;
  useReordering?: boolean;
  keyFn?: (row: any) => any;
  filter?: any;
  filterFn?: (row: any) => boolean;
  prepend?: Slot;
  append?: Slot;
  styleHeaderOnSelectAll?: boolean;
  empty?: ReactNode;
}

function ColumnHead({column, isSorted = false, isDescending = false, onSort}: {
  column: Column,
  isSorted?: boolean,
  isDescending?: boolean,
  onSort?: () => void
}) {
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
      return <CaretSortIcon/>
    }

    if (isDescending) {
      return <CaretDownIcon/>
    } else {
      return <CaretUpIcon/>
    }
  }

  function getHeaderCell() {
    const text = (column?.displayName ? column.displayName :
      column.name.substring(0, 1).toUpperCase() + column.name.substring(1).toLowerCase());
    if (column.sortable) {
      return (
        <Button containerClass={`flex ${getJustify()} w-full`} variant="ghost" onClick={onClick}>
          {text}
          {getSortIcon()}
        </Button>
      );
    }
    return (
      <span className={getMargin()}>{text}</span>
    )
  }

  return (
    <Omit omit={column?.hidden}>
      <TableHead>
        <AnimatePresence>
          <motion.div layout>
            {column?.header ? column.header : getHeaderCell()}
          </motion.div>
        </AnimatePresence>
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
    if (column.cell) {
      if (typeof column.cell === 'function') {
        const content = column.cell({row, col: column});
        if (content) {
          return (
            <TableCell className={getTextAlign()} key={column.name}
                       suppressHydrationWarning={column?.suppressHydrationWarning}>
              {content}
            </TableCell>
          );
        }
      } else {
        return column.cell;
      }
    }

    return (
      <TableCell className={getTextAlign()} key={column.name}
                 suppressHydrationWarning={column?.suppressHydrationWarning}>
        {column.formatFn ? column.formatFn(value) : value}
      </TableCell>
    );
  }

  return (
    <Omit key={column.name} omit={column?.hidden}>
      {getTableCell()}
    </Omit>
  );
}

export default function DataTable({
                                    columns,
                                    data = [],
                                    pageSize = 5,
                                    usePagination = true,
                                    useReordering = true,
                                    className,
                                    styleHeaderOnSelectAll = true,
                                    useSelection = true,
                                    selected = [],
                                    onSelect,
                                    keyFn = (row => row.id),
                                    filterFn,
                                    filter,
                                    prepend,
                                    append,
                                    empty
                                  }: DataTableProps) {
  const table = useTable({
    filterFn: filterFn,
    keyFn: keyFn,
    collection: data,
    selected,
    onSelect,
    pageSize,
    filter,
  });

  const {
    page, pageCount, prevPage, nextPage, rows, setRows, selectRow, selectAll, selectedAll,
    sortedBy, setSorted, isSortedDescending, setSortedDescending
  } = table;

  const isEmpty = !rows || !rows.length || rows.length === 0;

  function getTableBody() {
    if (useReordering) {
      return (
        <Reorder.Group as="tbody" className="[&_tr:last-child]:border-0 transition-[height]" axis="y" values={rows}
                       onReorder={setRows}>
          {
            rows?.map((row => {
              const isSelected = selected?.includes(row.id);
              return (
                <Reorder.Item as="tr"
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              data-state={isSelected ? 'selected' : 'false'}
                              key={keyFn(row)}
                              value={row}
                >
                  {
                    useSelection ?
                      <TableCell>
                        <Checkbox className="w-4 h-4" checked={isSelected}
                                  onClick={() => selectRow(row)}/>
                      </TableCell> : null
                  }
                  {columns.map(col => ColumnCell(row, col))}
                </Reorder.Item>
              )
            }))
          }
        </Reorder.Group>
      )
    } else {
      return (
        <TableBody>
          {
            rows?.map(row => {
              const isSelected = selected?.includes(row.id);
              return (
                <TableRow data-state={isSelected ? 'selected' : 'false'}
                          key={keyFn(row)}
                >
                  {
                    useSelection ?
                      <TableCell>
                        <Checkbox className="w-4 h-4" checked={isSelected}
                                  onClick={() => selectRow(row)}/>
                      </TableCell> : null
                  }
                  {columns.map(col => ColumnCell(row, col))}
                </TableRow>
              )
            })
          }
        </TableBody>
      )
    }
  }

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
      return slot({page, pageCount, prevPage, nextPage, rows, selected});
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
            <TableRow data-state={styleHeaderOnSelectAll ? (selectedAll ? 'selected' : 'false') : undefined}>
              {
                useSelection ?
                  <TableHead>
                    <Checkbox checked={selectedAll} onClick={selectAll}/>
                  </TableHead> : null
              }
              {
                columns.map(col =>
                  <ColumnHead key={col.name}
                              column={col}
                              isSorted={col.name === sortedBy}
                              isDescending={isSortedDescending}
                              onSort={() => onSort(col.name)}
                  />
                )
              }
            </TableRow>
          </TableHeader>
        </Omit>
        <Omit omit={!isEmpty} fallback={getTableBody()}>
          <TableBody>
            <TableRow>
              <TableCell>{empty || 'No data available ¯\\_(ツ)_/¯'}</TableCell>
            </TableRow>
          </TableBody>
        </Omit>
      </Table>
      {
        getSlot(append)
      }
    </div>
  )
}