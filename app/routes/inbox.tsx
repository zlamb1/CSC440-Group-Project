import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@ui/table";
import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {Checkbox} from "@ui/checkbox";
import {Input} from "@ui/input";
import {ReactNode, useEffect, useState} from "react";
import {Button} from "@ui/button";
import {Bell} from "lucide-react";
import Fade from "@ui/fade";

export async function loader({ context }: LoaderFunctionArgs) {
    if (!context.user.loggedIn) {
        return redirect('/');
    }

    const notifications = await context.db.getNotifications();
    return json({ notifications });
}

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

function usePagination(props?: { pageSize?: number, collection?: any[] }) {
    const [ page, setPage ] = useState(0);

    const collectionSize = props?.collection?.length ?? 0;
    const pageCount = Math.ceil(collectionSize / (props?.pageSize ?? 1));

    function prevPage() {
        return setPage(prev => Math.max(0, prev - 1));
    }

    function nextPage() {
        return setPage(prev => Math.min(prev + 1, (pageCount ?? 1) - 1));
    }

    return { page, pageCount, setPage, prevPage, nextPage };
}

function useTable(props?: { collection?: any[], pageSize?: number, keyFn?: (row: any) => any }) {
    const { page, pageCount, setPage, prevPage, nextPage } = usePagination({ pageSize: props?.pageSize, collection: props?.collection });
    const [ selected, setSelected ] = useState<any[]>([]);

    const pageSize = props?.pageSize ?? 1;

    function defaultKeyFunction(row: any) {
        return row;
    }

    const keyFn = props?.keyFn ?? defaultKeyFunction;

    function getRows(page: number) {
        const index = page * pageSize;
        return props?.collection?.slice(index, index + pageSize);
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
    const selectedAll = keys?.some(key => selected.includes(key));

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

export interface PrependProps {
    rows?: any[];
    selected: any[];
}

function InboxTable({ notifications, prepend }: { notifications?: any[], prepend?: ({rows, selected}: PrependProps) => ReactNode }) {
    const { page, selected, pageCount, rows, prevPage, nextPage, setPage, selectRow, selectAll, selectedAll } = useTable({ collection: notifications, keyFn: (row: any) => row.id });

    return (
        <div className="flex flex-col gap-3">
            {
                prepend ? prepend({rows, selected}) : null
            }
            <Table>
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
                    rows ?
                        <div className="flex-grow">
                            <div
                                className="select-none font-medium text-gray-400 text-sm">{selected.length} of {rows?.length} row(s)
                                selected
                            </div>
                        </div> : null
                }
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
                </div>
            </div>
        </div>
    )
}

export default function InboxRoute() {
    const data = useLoaderData<typeof loader>();

    function prepend({ selected }: PrependProps) {
        return (
            <div className="flex flex-row w-full">
                <Input className="w-1/3" placeholder="Filter" />
                <div className="flex-grow flex justify-end">
                    <Fade show={ selected.length > 0 }>
                        <Button className="flex flex-row items-center gap-2" variant="outline">Delete <Bell size={14} /></Button>
                    </Fade>
                </div>
            </div>
        );
    }

    return (
        <div className="m-8 w-full h-full flex flex-col gap-3">
            <InboxTable notifications={data?.notifications} prepend={prepend} />
        </div>
    );
}