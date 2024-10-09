import {Separator} from "@ui/separator";
import {Input} from "@ui/input";
import {Form, useLoaderData} from "@remix-run/react";
import {Label} from "@ui/label";
import {Textarea} from "@ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@ui/select";
import {Button} from "@ui/button";
import UserAvatar from "@components/UserAvatar";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {Edit} from "lucide-react";
import { motion } from "framer-motion";

export async function loader({ context }: LoaderFunctionArgs) {
    return json(context?.user);
}

export default function SettingsRoute() {
    const data = useLoaderData<typeof loader>();
    return (
        <div className="flex-grow flex flex-col gap-3 m-4">
            <span className="text-xl font-medium select-none">Account Settings</span>
            <Separator />
            <Form className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <Button containerClass="w-[50px] h-[50px]" className="relative rounded-full size-full" variant="ghost" size="icon">
                        <UserAvatar size="100%" className="text-2xl" userName={data?.userName} />
                        <motion.div animate={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    className="absolute size-full flex justify-center items-center bg-gray-950 bg-opacity-50">
                            <Edit />
                        </motion.div>
                    </Button>
                    <Label className="flex-grow flex flex-col gap-2">
                        Username
                        <Input placeholder={data?.userName} />
                    </Label>
                </div>
                <Label className="flex flex-col gap-2">
                    Name
                    <Input />
                </Label>
                <Label className="flex flex-col gap-2">
                    Bio
                    <Textarea />
                </Label>
                <Label className="flex flex-col gap-2">
                    Privacy Status
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Public" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="friends">Friends Only</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                    </Select>
                </Label>
                <div className="flex gap-3">
                    <Button variant="edit" type="submit">
                        Update Settings
                    </Button>
                    <Button containerClass="w-fit" variant="destructive">
                        Delete Account
                    </Button>
                </div>

            </Form>
        </div>
    )
}