import {Button} from "@ui/button";
import DataTable, {Slot, SlotProps} from "@components/table/DataTable";
import ReplyCell from "@components/table/notification/ReplyCell";
import {formatFutureDate, formatPastDate} from "@/utils/time";
import {onSelectType} from "@components/table/table";
import RequestCell from "@components/table/notification/RequestCell";

function formatType(type: string) {
  return type?.split?.('_')?.reduce((accumulator, word) => accumulator + ' ' + word?.charAt?.(0).toUpperCase() + word?.substring?.(1).toLowerCase(), '');
}

function DefaultAppend(props?: SlotProps) {
  if (!props?.rows || props?.rows.length <= 0) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-3">
      <div className="flex-grow">
        <div
          className="select-none font-medium text-gray-400 text-sm">{props?.selected?.length} of {props?.rows?.length} row(s)
          selected
        </div>
      </div>
      {
        props.pageCount > 1 ?
          <div className="flex flex-row gap-3">
            <Button variant="outline"
                    onClick={props?.prevPage}
                    disabled={props.page === 0}
            >
              Previous
            </Button>
            <Button variant="outline"
                    onClick={props?.nextPage}
                    disabled={props.page === props.pageCount - 1}
            >
              Next
            </Button>
          </div> : null
      }
    </div>
  );
}

export interface InboxTableProps {
  notifications?: any[];
  selected?: any[];
  onSelect?: onSelectType;
  filter?: string;
  prepend?: Slot;
  append?: Slot;
  compact?: boolean;
}

export default function InboxTable({
                                     notifications,
                                     selected,
                                     onSelect,
                                     filter,
                                     prepend,
                                     append,
                                     compact = false
                                   }: InboxTableProps) {
  const columns = [
    {
      name: 'dateIssued',
      displayName: 'Date Issued',
      align: 'center',
      formatFn: (date: any) => formatPastDate(date),
      sortable: true,
      hidden: compact,
      suppressHydrationWarning: true,
    },
    {
      name: 'type',
      align: 'center',
      formatFn: formatType,
      sortable: true,
    },
    {
      name: 'content',
      cell: ({row}: { row: any }) => {
        switch (row.type) {
          case 'follow_request':
            return <RequestCell row={row}/>
          case 'reply':
            return <ReplyCell row={row}/>
        }
      }
    },
    {
      name: 'expiresOn',
      displayName: 'Expires In',
      align: 'center',
      formatFn: formatFutureDate,
      sortable: true,
      hidden: compact,
      suppressHydrationWarning: true,
    }
  ];

  return (
    <div className="flex flex-col gap-3">
      <DataTable data={notifications}
                 columns={columns}
                 filter={filter}
                 filterFn={row => !filter || row?.content?.toLowerCase().includes(filter?.toLowerCase())}
                 useSelection={!compact}
                 selected={selected}
                 onSelect={onSelect}
                 useReordering={!compact}
                 prepend={prepend}
                 append={typeof append === 'undefined' ? DefaultAppend : append}
                 pageSize={compact ? 5 : 15}
                 empty="You have no notifications."
      />
    </div>
  )
}