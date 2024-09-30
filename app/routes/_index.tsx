import NotImplemented from "@components/NotImplemented";
import type {LoaderFunctionArgs} from "@remix-run/node";

export async function loader({ context }: LoaderFunctionArgs) {
    return null;
}

export default function Index() {
    return <NotImplemented />;
}