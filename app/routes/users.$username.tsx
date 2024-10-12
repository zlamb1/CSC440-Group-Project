import {LoaderFunctionArgs} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";
import {useLoaderData} from "@remix-run/react";

export async function loader({ context, params }: LoaderFunctionArgs) {
    return await tryDatabaseAction(async () => {
        return context.db.getUserByUsername(params.username);
    });
}

export default function UserRoute() {
    const data = useLoaderData<typeof loader>();
    return (
        <pre className="w-3/4 break-all text-wrap flex">
            <code className="">
                {
                    JSON.stringify(data)
                }
            </code>
        </pre>
    );
}