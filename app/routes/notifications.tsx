import {LoaderFunctionArgs} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";
import NotFound from "@/routes/$";

export async function loader({ context }: LoaderFunctionArgs) {
    return await tryDatabaseAction(async () => {
        return await context.db.getNotifications();
    });
}

export default NotFound;