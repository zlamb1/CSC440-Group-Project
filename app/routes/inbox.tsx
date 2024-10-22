import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@ui/table";
import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {Checkbox} from "@ui/checkbox";
import {Input} from "@ui/input";
import {ReactNode, useEffect, useState} from "react";
import {Button} from "@ui/button";
import {Bell, Search} from "lucide-react";
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

function usePagination(props?: { pageSize?: number, pageCount?: number}) {
    const [ page, setPage ] = useState(0);

    function prevPage() {
        return setPage(prev => Math.max(0, prev - 1));
    }

    function nextPage() {
        return setPage(prev => Math.min(prev + 1, (props?.pageCount ?? 1) - 1));
    }

    return { page, setPage, prevPage, nextPage };
}

function useTable(props?: { collection?: any[], pageSize?: number, filterFn?: (row: any) => boolean, keyFn?: (row: any) => any }) {
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

export interface PrependProps {
    rows?: any[];
    selected: any[];
    filter?: string;
}

function InboxTable({ notifications, filter, prepend }: { notifications?: any[], filter?: string, prepend?: ({rows, selected}: PrependProps) => ReactNode }) {
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

export default function InboxRoute() {
    const data = useLoaderData<typeof loader>();
    const [ filter, setFilter ] = useState('');

    function prepend({selected}: PrependProps) {
        return (
            <div className="flex flex-row w-full">
                <Input value={filter} onChange={ (evt) => setFilter(evt.target.value) } className="w-1/3" placeholder="Search" />
                <div className="flex-grow flex justify-end">
                    <Fade show={selected.length > 0}>
                        <Button className="flex flex-row items-center gap-2" variant="outline">Delete <Bell size={14} /></Button>
                    </Fade>
                </div>
            </div>
        );
    }

    return (
        <div className="m-8 w-full h-full flex flex-col gap-3">
            <InboxTable notifications={data?.notifications} filter={filter} prepend={prepend} />
        </div>
    );
}