import {Separator} from "@ui/separator";
import {Input} from "@ui/input";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {Label} from "@ui/label";
import {Textarea} from "@ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@ui/select";
import {Button} from "@ui/button";
import UserAvatar from "@components/user/UserAvatar";
import {
    ActionFunctionArgs,
    json,
    LoaderFunctionArgs,
    unstable_parseMultipartFormData
} from "@remix-run/node";
import {Edit2, X} from "lucide-react";
import {motion} from "framer-motion";
import {useEffect, useRef, useState} from "react";
import {
    createImageUploader,
    IMAGE_API_V1, IMAGE_CDN_URL, IMAGE_DEV_CDN_URL,
    removeAvatar
} from "@/utils/image-uploader";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";
import Fade from "@ui/fade";
import {ProfileVisibility} from "@prisma/client";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {ExplicitUpdateResponse} from "@/api/UpdateResponse";

const isProduction = process.env.NODE_ENV === "production";

export async function loader({ context }: LoaderFunctionArgs) {
    return json(context.user);
}

export async function action({ context, request }: ActionFunctionArgs) {
    try {
        const uploadHandler = createImageUploader({ directory: isProduction ? IMAGE_API_V1 : undefined });

        const formData = await unstable_parseMultipartFormData(
            request,
            uploadHandler
        );

        const isUpdatingAvatar = formData.get("is-updating-avatar") === 'true';
        const file = formData.get("avatar");

        const displayName = formData.get('displayName');
        const bio = formData.get('bio');
        const visibility = formData.get('visibility');

        const avatar = isProduction ?
            (file?.name ? `${IMAGE_CDN_URL}${file?.name}` : null) :
            (file?.name ? `${IMAGE_DEV_CDN_URL}${file.name}` : null);

        if (!isProduction) {
            if (!process.env.CDN_API_KEY) {
                return UnknownErrorResponse('Cannot upload images without CDN API key.');
            }

            const CDN_UPLOAD_URL = 'https://cdn.zlamb1.com/images/upload/';

            const formData = new FormData();
            formData.set('image', file);
            formData.set('api_key', process.env.CDN_API_KEY);

            try {
                await fetch(CDN_UPLOAD_URL, {
                    method: 'POST',
                    body: formData,
                });
            } catch (err) {
                return UnknownErrorResponse(err);
            } finally {
                if (file.remove) {
                    file.remove();
                }
            }
        }

        const oldAvatar = context.user.avatarPath;

        if (isUpdatingAvatar) {
            const user = await context.prisma.user.update({
                data: {
                    avatarPath: avatar,
                },
                where: {
                    id: context.user.id,
                },
            });

            if (!user) {
                return ExplicitResourceNotFoundResponse('User');
            }
        }

        if (isProduction) {
            removeAvatar(oldAvatar);
        }

        await context.prisma.user.update({
            data: {
                displayName, bio, visibility,
            },
            where: {
                id: context.user.id,
            },
        });

        return ExplicitUpdateResponse('User');
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}

function formatKey(key: string) {
    return key.substring(0, 1).toUpperCase() + key.substring(1).toLowerCase();
}

export default function SettingsRoute() {
    const data = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const [ userAvatar, setUserAvatar ] = useState<string | undefined>(data?.avatarPath);
    const [ isAvatarUpdated, setIsAvatarUpdated ] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (fetcher.state === 'idle') {
            setUserAvatar(data?.avatarPath);
            setIsAvatarUpdated(false)
        }
    }, [fetcher]);

    function onClick() {
        fileInputRef.current?.click();
    }

    function onChangeAvatar() {
        setIsAvatarUpdated(true);
        if (fileInputRef.current) {
            if (fileInputRef.current?.files && fileInputRef.current.files?.length > 0) {
                const file = fileInputRef.current.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    // @ts-ignore
                    setUserAvatar(reader.result);
                }
                reader.readAsDataURL(file);
            }
        }
    }

    function clearAvatar() {
        if (fileInputRef.current) {
            if (userAvatar === data?.avatarPath) {
                setUserAvatar(undefined);
                setIsAvatarUpdated(true);
                fileInputRef.current.value = '';
            } else {
                setUserAvatar(data?.avatarPath);
                setIsAvatarUpdated(false);
            }
        }
    }

    return (
        <div className="flex-grow flex flex-col gap-3 m-4">
            <span className="text-xl font-medium select-none">Account Settings</span>
            <Separator />
            <fetcher.Form method="POST" encType="multipart/form-data" className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Button containerClass="w-[50px] h-[50px]" className="relative rounded-full size-full" variant="ghost" size="icon" type="button" onClick={ onClick }>
                                <UserAvatar size="100%" className="text-2xl" avatar={userAvatar} userName={data?.userName} />
                                <motion.div animate={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            className="absolute size-full flex justify-center items-center bg-gray-950 bg-opacity-20 dark:bg-opacity-50">
                                    <Edit2 className="text-white" size={20} />
                                    <Input type="text" readOnly className="hidden" name="is-updating-avatar" value={'' + isAvatarUpdated} />
                                    <Input type="file" accept="image/*" className="hidden" name="avatar" onChange={onChangeAvatar} ref={fileInputRef} />
                                </motion.div>
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="rounded-full border-0 w-fit h-fit p-0">
                            <Fade initial={false} show={userAvatar || data?.avatarPath}>
                                <Button className="w-[25px] h-[25px] rounded-full" size="icon" variant="destructive" type="button"
                                        onClick={clearAvatar}>
                                    <X size={16} />
                                </Button>
                            </Fade>
                        </HoverCardContent>
                    </HoverCard>
                    <Label className="flex-grow flex flex-col gap-2">
                        Username
                        <Input placeholder={data?.userName}/>
                    </Label>
                </div>
                <Label className="flex flex-col gap-2">
                    Display Name
                    <Input defaultValue={data?.displayName} name="displayName" />
                </Label>
                <Label className="flex flex-col gap-2">
                    Bio
                    <Textarea defaultValue={data?.bio} name="bio" />
                </Label>
                <Label className="flex flex-col gap-2">
                    Profile Visibility
                    <Select name="visibility" defaultValue={data?.visibility}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Public" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                Object.keys(ProfileVisibility).map(key => <SelectItem key={key} value={key}>{ formatKey(key) }</SelectItem>)
                            }
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
            </fetcher.Form>
        </div>
    )
}