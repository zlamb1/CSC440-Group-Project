import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {Input} from "@ui/input";
import { useState} from "react";
import {Button} from "@ui/button";
import {Bell, Search, X} from "lucide-react";
import Fade from "@ui/fade";
import InboxTable from "@components/table/InboxTable";
import {SlotProps} from "@components/table/DataTable";
import {fetchNotifications} from "@/routes/notifications";

export async function loader({ context }: LoaderFunctionArgs) {
    if (!context.user.loggedIn) {
        return redirect('/');
    }

    const notifications = await fetchNotifications(context, context.user.id);

    return json({ notifications });
}

export default function InboxRoute() {
    const data = useLoaderData<typeof loader>();
    const [ filter, setFilter ] = useState('');

    function prepend({selected}: SlotProps) {
        const clear = (
            <Fade id="clear" show={!!filter}>
                <Button className="text-gray-400 w-6 h-6 rounded-full" size="icon" variant="ghost" onClick={ () => setFilter('') }>
                    <X size={14} />
                </Button>
            </Fade>
        );

        return (
            <div className="flex flex-row w-full">
                <Input value={filter}
                       onChange={ (evt) => setFilter(evt.target.value) }
                       className="w-1/3"
                       placeholder="Search"
                       prepend={<div className="flex justify-center items-center w-6 h-6"><Search size={14} className="text-gray-400" /></div>}
                       append={clear}
                />
                <div className="flex-grow flex justify-end">
                    <Fade show={selected && selected.length > 0}>
                        <Button className="flex flex-row items-center gap-2" variant="outline">Dismiss <Bell size={14} /></Button>
                    </Fade>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 w-full h-full flex flex-col gap-3">
            <InboxTable notifications={data?.notifications} filter={filter} prepend={prepend} />
        </div>
    );
}