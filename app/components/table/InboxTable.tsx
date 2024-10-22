import {ReactNode, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ui/table";
import {Checkbox} from "@ui/checkbox";
import {Button} from "@ui/button";
import useTable from "@components/table/table";

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

export interface PrependProps {
    rows?: any[];
    selected: any[];
    filter?: string;
}

export interface InboxTableProps {
    notifications?: any[];
    filter?: string;
    prepend?: ({rows, selected}: PrependProps) => ReactNode;
}

export default function InboxTable({ notifications, filter, prepend }: InboxTableProps) {
    const { page, selected, pageCount, rows, prevPage, nextPage, selectRow, selectAll, selectedAll } =
        useTable({
            collection: notifications,
            filterFn: row => row.content?.toLowerCase().includes(filter),
            keyFn: row => row.id
        });
    return (
        <div className="flex flex-col gap-3">
            {
                prepend ? prepend({rows, selected}) : null
            }
            <Table id="inbox">
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Checkbox checked={selectedAll} onClick={ selectAll } />
                        </TableHead>
                        <TableHead>Date Issued</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Expires In</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        rows && rows.length > 0 ? null :
                            <TableRow>
                                <TableCell>You have no notifications! :(</TableCell>
                            </TableRow>
                    }
                    {
                        rows?.map((n: any) =>
                            <TableRow key={n.id}>
                                <TableCell>
                                    <Checkbox className="w-4 h-4" checked={selected.includes(n.id)} onClick={ () => selectRow(n) } />
                                </TableCell>
                                <TableCell>{formatDate(n.dateIssued, 'ago')}</TableCell>
                                <TableCell>{formatType(n.type)}</TableCell>
                                <TableCell>{n.content}</TableCell>
                                <TableCell>{formatDate(n.expiresOn)}</TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
            <div className="flex flex-row items-center gap-3">
                {
                    rows && rows.length > 0 ?
                        <div className="flex-grow">
                            <div
                                className="select-none font-medium text-gray-400 text-sm">{selected.length} of {rows?.length} row(s)
                                selected
                            </div>
                        </div> : null
                }
                {
                    pageCount > 1 ?
                        <div className="flex flex-row gap-3">
                            <Button variant="outline"
                                    onClick={prevPage}
                                    disabled={page === 0}
                            >
                                Previous
                            </Button>
                            <Button variant="outline"
                                    onClick={nextPage}
                                    disabled={page === pageCount - 1}
                            >
                                Next
                            </Button>
                        </div> : null
                }
            </div>
        </div>
    )
}