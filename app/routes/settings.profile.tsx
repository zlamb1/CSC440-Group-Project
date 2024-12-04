import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";
import {Button} from "@ui/button";
import UserAvatar from "@components/user/UserAvatar";
import {motion} from "framer-motion";
import {CalendarIcon, Edit2, X} from "lucide-react";
import {Input} from "@ui/input";
import Fade from "@ui/fade";
import {Label} from "@ui/label";
import {ErrorContext} from "@components/error/ErrorContext";
import DatePicker from "@components/DatePicker";
import {formatMDY} from "@/utils/time";
import {Textarea} from "@ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@ui/select";
import {ProfileVisibility} from "@prisma/client";
import UserDeletionDialog from "@components/user/UserDeletionDialog";
import {useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "@/utils/context/UserContext";
import {useFetcher} from "@remix-run/react";
import {useErrorToast, useSuccessToast, useUnknownErrorToast} from "@/utils/toast";
import {ActionFunctionArgs, unstable_parseMultipartFormData} from "@remix-run/node";
import {
  createImageUploader,
  IMAGE_API_V1,
  IMAGE_CDN_URL,
  IMAGE_DEV_CDN_URL,
  removeAvatar
} from "@/utils/image-uploader";
import {validateUsername} from "@/utils/login-validation";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {ExplicitUpdateResponse} from "@/api/UpdateResponse";

function parseBirthDate(birthDate: string) {
  if (!birthDate) {
    return undefined;
  }

  if (birthDate === 'null') {
    return null;
  }

  return new Date(birthDate);
}

const isProduction = process.env.NODE_ENV === "production";

export async function action({context, request}: ActionFunctionArgs) {
  try {
    const uploadHandler = createImageUploader({directory: isProduction ? IMAGE_API_V1 : undefined});

    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );

    const userName = String(formData.get('userName'));
    if (userName && userName !== context.user.userName) {
      const userNameValidation = await validateUsername(context, userName);
      if (userNameValidation) {
        return userNameValidation;
      }
    }

    const isUpdatingAvatar = formData.get("is-updating-avatar") === 'true';
    const file = formData.get("avatar");
    const cdnAvatarPath = isProduction ? (file?.name ? `${IMAGE_CDN_URL}${file?.name}` : null) :
      (file?.name ? `${IMAGE_DEV_CDN_URL}${file.name}` : null);

    const displayName = formData.get('displayName');
    const bio = formData.get('bio');
    const birthDate = formData.get('birthDate');
    const visibility = formData.get('visibility');

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

    if (isUpdatingAvatar && isProduction) {
      removeAvatar(oldAvatar);
    }

    const user = await context.prisma.user.update({
      data: {
        userName: userName || undefined,
        avatarPath: isUpdatingAvatar ? cdnAvatarPath : undefined,
        birthDate: parseBirthDate(birthDate),
        displayName,
        bio,
        visibility,
      },
      where: {
        id: context.user.id,
      },
    });

    if (!user) {
      return ExplicitResourceNotFoundResponse('User');
    }

    return ExplicitUpdateResponse('User');
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}

function formatKey(key: string) {
  return key.substring(0, 1).toUpperCase() + key.substring(1).toLowerCase();
}

export default function SettingsProfileRoute() {
  const user = useContext(UserContext);
  const fetcher = useFetcher();
  const [userAvatar, setUserAvatar] = useState<string | null | undefined>(user?.avatarPath);
  const [isAvatarUpdated, setIsAvatarUpdated] = useState<boolean>(false);
  const [birthDate, setBirthDate] = useState<Date | undefined | null>(user?.birthDate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fetcher.state === 'idle') {
      setUserAvatar(user?.avatarPath ?? undefined);
      setIsAvatarUpdated(false);
      setBirthDate(user?.birthDate);
    }
  }, [fetcher]);

  useEffect(() => {
    if (fetcher?.data) {
      if (fetcher.data.success) {
        useSuccessToast('Updated Profile');
      } else if (fetcher.data.error) {
        useErrorToast(fetcher.data.error);
      } else if (!fetcher.data.username) {
        useUnknownErrorToast();
      }
    }
  }, [fetcher?.data]);

  function onClick() {
    fileInputRef.current?.click();
  }

  function onChangeAvatar() {
    if (fileInputRef.current) {
      if (fileInputRef.current?.files && fileInputRef.current.files?.length > 0) {
        const file = fileInputRef.current.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          // @ts-ignore
          setUserAvatar(reader.result);
          setIsAvatarUpdated(true);
        }
        reader.readAsDataURL(file);
      }
    }
  }

  function clearAvatar() {
    if (fileInputRef.current) {
      if (userAvatar === user?.avatarPath) {
        setUserAvatar(null);
        fileInputRef.current.value = '';
      } else {
        setUserAvatar(undefined);
      }
    }
  }

  return (
    <fetcher.Form method="POST" encType="multipart/form-data" style={{alignSelf: 'center'}}
                  className="flex-grow flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button containerClass="w-[50px] h-[50px]" className="relative rounded-full size-full" variant="ghost"
                    size="icon" type="button" onClick={onClick}>
              <UserAvatar size="100%" className="text-2xl" avatar={userAvatar} userName={user?.userName}/>
              <motion.div animate={{opacity: 0}}
                          whileHover={{opacity: 1}}
                          className="absolute size-full flex justify-center items-center bg-gray-950 bg-opacity-20 dark:bg-opacity-50">
                <Edit2 className="text-white" size={20}/>
                <Input type="text" className="hidden" name="is-updating-avatar" value={'' + isAvatarUpdated}
                       readOnly/>
                <input type="file" accept="image/*" className="hidden" name="avatar" onChange={onChangeAvatar}
                       ref={fileInputRef}/>
              </motion.div>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="rounded-full border-0 w-fit h-fit p-0">
            <Fade initial={false} show={!!userAvatar || !!user?.avatarPath}>
              <Button className="w-[25px] h-[25px] rounded-full" size="icon" variant="destructive" type="button"
                      onClick={clearAvatar}>
                <X size={16}/>
              </Button>
            </Fade>
          </HoverCardContent>
        </HoverCard>
        <Label className="flex-grow flex flex-col gap-2">
          Username
          <Input name="userName" placeholder={user?.userName}/>
          <ErrorContext msg={fetcher?.data?.username}/>
        </Label>
      </div>
      <Label className="flex flex-col gap-2">
        Display Name
        <Input defaultValue={user?.displayName ?? ''} name="displayName"/>
      </Label>
      <Label className="flex flex-col gap-2">
        Date of Birth
        <Input className="hidden" name="birthDate" value={birthDate === null ? 'null' : birthDate?.toString?.()}
               readOnly/>
        <DatePicker value={birthDate}
                    onChangeValue={setBirthDate}
                    fromYear={1900} toYear={new Date().getFullYear()}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
        >
          <Button containerClass="w-full" className="w-full pl-3 text-left font-normal" variant="outline"
                  noClickAnimation disableRipple>
            <span>{birthDate ? formatMDY(birthDate) : 'Pick a date'}</span>
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
          </Button>
        </DatePicker>
      </Label>
      <Label className="flex flex-col gap-2">
        Bio
        <Textarea defaultValue={user?.bio ?? ''} name="bio"/>
      </Label>
      <Label className="flex flex-col gap-2">
        Profile Visibility
        <Select name="visibility" defaultValue={user?.visibility}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Public"/>
          </SelectTrigger>
          <SelectContent>
            {
              Object.keys(ProfileVisibility).map(key => <SelectItem key={key}
                                                                    value={key}>{formatKey(key)}</SelectItem>)
            }
          </SelectContent>
        </Select>
      </Label>
      <div className="flex justify-center gap-3">
        <UserDeletionDialog>
          <Button containerClass="w-fit" variant="destructive">
            Delete Account
          </Button>
        </UserDeletionDialog>
        <Button variant="edit" type="submit">
          Update Settings
        </Button>
      </div>
    </fetcher.Form>
  );
}