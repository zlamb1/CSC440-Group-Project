import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@ui/table";
import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";

export async function loader({ context }: LoaderFunctionArgs) {
    if (!context.user.loggedIn) {
        return redirect('/');
    }

    const notifications = await context.db.getNotifications();
    return json({ notifications });
}

export default function InboxRoute() {
    const data = useLoaderData<typeof loader>();
    return (
        <div className="m-8 w-full h-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date Issued</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Expires On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        data?.notifications.map((notification: any) =>
                            <TableRow key={notification.id}>
                                <TableCell>{notification.dateIssued}</TableCell>
                                <TableCell>{notification.type}</TableCell>
                                <TableCell>{notification.content}</TableCell>
                                <TableCell>{notification.expiresOn}</TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        </div>
    );
}