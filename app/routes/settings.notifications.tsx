import {useFetcher} from "@remix-run/react";
import {Label} from "@ui/label";
import {Button} from "@ui/button";
import {Separator} from "@ui/separator";
import {Switch} from "@ui/switch";
import {useContext, useEffect, useState} from "react";
import {ActionFunctionArgs} from "@remix-run/node";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitUpdateResponse} from "@/api/UpdateResponse";
import {UserContext} from "@/utils/context/UserContext";
import {useErrorToast, useSuccessToast, useUnknownErrorToast} from "@/utils/toast";

function asBoolean(str?: string | null) {
  return str === 'on';
}

export async function action({context, request}: ActionFunctionArgs) {
  if (!context.user.loggedIn) {
    return UnauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const muteReplies = asBoolean(formData.get('muteReplies'));
    const muteRequests = asBoolean(formData.get('muteRequests'));
    const dismissReplies = asBoolean(formData.get('dismissReplies'));
    const dismissRequests = asBoolean(formData.get('dismissRequests'));

    await context.prisma.notificationSettings.upsert({
      where: {
        userId: context.user.id,
      },
      update: {
        muteReplies, muteRequests, dismissReplies, dismissRequests,
      },
      create: {
        userId: context.user.id, muteReplies, muteRequests, dismissReplies, dismissRequests,
      },
    });

    return ExplicitUpdateResponse('Notification Settings');
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}

export default function SettingsNotificationsRoute() {
  const fetcher = useFetcher();
  const user = useContext(UserContext);
  const [muteReplies, setMuteReplies] = useState<boolean>(!!user?.notificationSettings?.muteReplies);
  const [muteRequests, setMuteRequests] = useState<boolean>(!!user?.notificationSettings?.muteRequests);
  const [dismissReplies, setDismissReplies] = useState<boolean>(!!user?.notificationSettings?.dismissReplies);
  const [dismissRequests, setDismissRequests] = useState<boolean>(!!user?.notificationSettings?.dismissRequests);

  useEffect(() => {
    setMuteReplies(!!user?.notificationSettings?.muteReplies);
    setMuteRequests(!!user?.notificationSettings?.muteRequests);
    setDismissReplies(!!user?.notificationSettings?.dismissReplies);
    setDismissRequests(!!user?.notificationSettings?.dismissRequests);
  }, [user]);

  useEffect(() => {
    if (fetcher?.data) {
      if (fetcher.data.success) {
        useSuccessToast('Updated Notification Settings');
      } else if (fetcher.data.error) {
        useErrorToast(fetcher.data.error);
      } else {
        useUnknownErrorToast();
      }
    }
  }, [fetcher?.data]);

  const muteAll = muteReplies && muteRequests;
  const dismissAll = dismissReplies && dismissRequests;

  function onMuteAll() {
    setMuteReplies(!muteAll);
    setMuteRequests(!muteAll);
  }

  function onDismissAll() {
    setDismissReplies(!dismissAll);
    setDismissRequests(!dismissAll);
  }

  return (
    <div className="flex justify-center">
      <fetcher.Form method="POST" className="w-full flex flex-col gap-3">
        <Label className="flex flex-col py-1 px-6">
          <div className="flex justify-between gap-3">
            Mute All Notifications
            <Switch checked={muteAll} onCheckedChange={onMuteAll}/>
          </div>
          <div className="text-xs text-muted-foreground">Mark all notifications as read.</div>
        </Label>
        <Separator/>
        <Label className="flex flex-col py-1 px-6">
          <div className="flex justify-between gap-3">
            Mute Replies
            <Switch name="muteReplies" checked={muteReplies} onCheckedChange={setMuteReplies}/>
          </div>
          <div className="text-xs text-muted-foreground">Mark all replies as read.</div>
        </Label>
        <Separator/>
        <Label className="flex flex-col py-1 px-6">
          <div className="flex justify-between gap-3">
            Mute Follow Requests
            <Switch name="muteRequests" checked={muteRequests} onCheckedChange={setMuteRequests}/>
          </div>
          <div className="text-xs text-muted-foreground">Mark all follow requests as read.</div>
        </Label>
        <Separator/>
        <Label className="flex flex-col py-1 px-6">
          <div className="flex justify-between gap-3">
            Dismiss All Notifications
            <Switch checked={dismissAll} onCheckedChange={onDismissAll}/>
          </div>
          <div className="text-xs text-muted-foreground">Automatically dismiss all notifications.</div>
        </Label>
        <Separator/>
        <Label className="flex flex-col py-1 px-6">
          <div className="flex justify-between gap-3">
            Dismiss Replies
            <Switch name="dismissReplies" checked={dismissReplies} onCheckedChange={setDismissReplies}/>
          </div>
          <div className="text-xs text-muted-foreground">Automatically dismiss replies.</div>
        </Label>
        <Separator/>
        <Label className="flex flex-col py-1 px-6">
          <div className="flex justify-between gap-3">
            Dismiss Requests
            <Switch name="dismissRequests" checked={dismissRequests} onCheckedChange={setDismissRequests}/>
          </div>
          <div className="text-xs text-muted-foreground">Automatically dismiss follow requests.</div>
        </Label>
        <div className="flex justify-center pt-4">
          <Button type="submit">
            Submit
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}