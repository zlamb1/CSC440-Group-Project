import {useFetcher} from "@remix-run/react";
import {Label} from "@ui/label";
import {Button} from "@ui/button";
import {Switch} from "@ui/switch";
import {useState} from "react";

export default function SettingsNotificationsRoute() {
  const fetcher = useFetcher();
  const [muteReplies, setMuteReplies] = useState<boolean>(false);
  const [muteRequests, setMuteRequests] = useState<boolean>(false);
  const [dismissReplies, setDismissReplies] = useState<boolean>(false);
  const [dismissRequests, setDismissRequests] = useState<boolean>(false);

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
      <fetcher.Form className="w-full md:w-[80%] lg:w-[75%] xl:w-[50%] flex flex-col gap-3">
        <Label className="flex flex-col">
          <div className="flex justify-between gap-3">
            Mute All Notifications
            <Switch checked={muteAll} onCheckedChange={onMuteAll}/>
          </div>
          <div className="text-xs text-muted-foreground">Mark all notifications as read.</div>
        </Label>
        <Label className="flex flex-col">
          <div className="flex justify-between gap-3">
            Mute Replies
            <Switch checked={muteReplies} onCheckedChange={setMuteReplies}/>
          </div>
          <div className="text-xs text-muted-foreground">Mark all replies as read.</div>
        </Label>
        <Label className="flex flex-col">
          <div className="flex justify-between gap-3">
            Mute Follow Requests
            <Switch checked={muteRequests} onCheckedChange={setMuteRequests}/>
          </div>
          <div className="text-xs text-muted-foreground">Mark all follow requests as read.</div>
        </Label>
        <Label className="flex flex-col">
          <div className="flex justify-between gap-3">
            Dismiss All Notifications
            <Switch checked={dismissAll} onCheckedChange={onDismissAll}/>
          </div>
          <div className="text-xs text-muted-foreground">Automatically dismiss all notifications.</div>
        </Label>
        <Label className="flex flex-col">
          <div className="flex justify-between gap-3">
            Dismiss Replies
            <Switch checked={dismissReplies} onCheckedChange={setDismissReplies}/>
          </div>
          <div className="text-xs text-muted-foreground">Automatically dismiss replies.</div>
        </Label>
        <Label className="flex flex-col">
          <div className="flex justify-between gap-3">
            Dismiss Requests
            <Switch checked={dismissRequests} onCheckedChange={setDismissRequests}/>
          </div>
          <div className="text-xs text-muted-foreground">Automatically dismiss follow requests.</div>
        </Label>
        <div className="flex justify-center">
          <Button type="submit">
            Submit
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}