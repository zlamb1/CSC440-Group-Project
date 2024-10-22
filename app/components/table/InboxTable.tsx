import {ReactNode, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ui/table";
import {Checkbox} from "@ui/checkbox";
import {Button} from "@ui/button";
import useTable from "@components/table/table";
import Omit from "@ui/omit";
import Fade from "@ui/fade";

function formatType(type: string) {
    return type?.substring(0, 1)?.toUpperCase() + type.substring(1).toLowerCase();
}

function formatDate(date: Date | string, suffix?: string) {
    if (typeof date === "string") {
        date = new Date(date);
    }

    const now = new Date();
    const d1 = now > date ? now : date;
    const d2 = now > date ? date : now;

    const years = d1.getFullYear() - d2.getFullYear();
    if (years == 0) {
        const months = d1.getMonth() - d2.getMonth();
        if (months == 0) {
            const days = d1.getDate() - d2.getDate();
            if (days == 0) {
                const hours = d1.getHours() - d2.getHours();
                if (hours == 0) {
                    const minutes = d1.getMinutes() - d2.getMinutes();
                    if (minutes == 0) {
                        const seconds = d1.getSeconds() - d2.getSeconds();
                        return `${seconds} second${seconds > 1 ? 's' : ''}` + (suffix ? ` ${suffix}` : '');
                    }
                    return `${minutes} minute${minutes > 1 ? 's' : ''}` + (suffix ? ` ${suffix}` : '');
                }
                return `${hours} hour${hours > 1 ? 's' : ''}` + (suffix ? ` ${suffix}` : '');
            }
            return `${days} day${days > 1 ? 's' : ''}` + (suffix ? ` ${suffix}` : '');
        }
        return `${months} month${months > 1 ? 's' : ''}` + (suffix ? ` ${suffix}` : '');
    }
    return `${years} year${years > 1 ? 's' : ''}` + (suffix ? ` ${suffix}` : '');
}

function DefaultAppend(props?: any) {
    return (
        <div className="flex flex-row items-center gap-3">
            {
                !props?.compact && props?.rows && props?.rows.length > 0 ?
                    <div className="flex-grow">
                        <div
                            className="select-none font-medium text-gray-400 text-sm">{props?.selected.length} of {props?.rows?.length} row(s)
                            selected
                        </div>
                    </div> : null
            }
            {
                props?.pageCount > 1 ?
                    <div className="flex flex-row gap-3">
                        <Button variant="outline"
                                onClick={props?.prevPage}
                                disabled={props?.page === 0}
                        >
                            Previous
                        </Button>
                        <Button variant="outline"
                                onClick={props?.nextPage}
                                disabled={props?.page === props?.pageCount - 1}
                        >
                            Next
                        </Button>
                    </div> : null
            }
        </div>
    );
}

export interface PrependProps {
    rows?: any[];
    selected: any[];
}

type Slot = (({rows, selected}: PrependProps) => ReactNode) | ReactNode;

export interface InboxTableProps {
    notifications?: any[];
    filter?: string;
    prepend?: Slot;
    append?: Slot;
    compact?: boolean;
}

export default function InboxTable({notifications, filter, prepend, append, compact = false}: InboxTableProps) {
    const table = useTable({
        collection: notifications,
        filterFn: row => row.content?.toLowerCase().includes(filter),
        keyFn: row => row.id
    });

    const {selected, rows, selectRow, selectAll, selectedAll} = table;

    function getReactNode(prop: Slot, fallback: ReactNode) {
        if (typeof prop === 'undefined') {
            return fallback;
        }

        if (typeof prop === "function") {
            return prop({rows, selected});
        }

        return prop;
    }

    return (
        <div className="flex flex-col gap-3">
            {
                getReactNode(prepend, null)
            }
            <Fade show={rows && rows.length > 0} fallback={<div>You have no notifications! :(</div>}>
                <Table id="inbox">
                    <TableHeader>
                        <TableRow>
                            <Omit omit={compact}>
                                <TableHead>
                                    <Checkbox checked={selectedAll} onClick={ selectAll } />
                                </TableHead>
                                <TableHead>Date Issued</TableHead>
                            </Omit>
                            <TableHead>Type</TableHead>
                            <TableHead>Content</TableHead>
                            <Omit omit={compact}>
                                <TableHead>Expires In</TableHead>
                            </Omit>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            rows?.map((n: any) =>
                                <TableRow key={n.id}>
                                    <Omit omit={compact}>
                                        <TableCell>
                                            <Checkbox className="w-4 h-4" checked={selected.includes(n.id)} onClick={ () => selectRow(n) } />
                                        </TableCell>
                                        <TableCell>{formatDate(n.dateIssued, 'ago')}</TableCell>
                                    </Omit>
                                    <TableCell>{formatType(n.type)}</TableCell>
                                    <TableCell>{n.content}</TableCell>
                                    <Omit omit={compact}>
                                        <TableCell>{formatDate(n.expiresOn)}</TableCell>
                                    </Omit>
                                </TableRow>
                            )
                        }
                    </TableBody>
                </Table>
            </Fade>
            {
                getReactNode(append,
                    <DefaultAppend {...table} compact={compact} />
                )
            }
        </div>
    )
}