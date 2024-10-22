import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {Input} from "@ui/input";
import { useState} from "react";
import {Button} from "@ui/button";
import {Bell} from "lucide-react";
import Fade from "@ui/fade";
import InboxTable, {PrependProps} from "@components/table/InboxTable";

export async function loader({ context }: LoaderFunctionArgs) {
    if (!context.user.loggedIn) {
        return redirect('/');
    }

    const notifications = await context.db.getNotifications();
    return json({ notifications });
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