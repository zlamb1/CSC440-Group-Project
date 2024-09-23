import {LoaderFunctionArgs} from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
    throw new Response(null, {
        status: 404,
        statusText: "Not Found",
    });
}