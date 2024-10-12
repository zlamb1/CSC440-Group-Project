import {LoaderFunctionArgs} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";

export async function loader({ context, params }: LoaderFunctionArgs) {
    return await tryDatabaseAction(async () => {
        return context.db.getReplies(params.id);
    });
}