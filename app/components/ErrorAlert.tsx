import {Alert, AlertDescription, AlertTitle} from "@ui/alert";
import {TriangleAlert, TriangleAlertIcon} from "lucide-react";

export default function ErrorAlert({ msg }: { msg: string }) {
    return (
        <Alert variant="destructive">
            <TriangleAlertIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                { msg }
            </AlertDescription>
        </Alert>
    );
}