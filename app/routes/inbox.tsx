import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {useFetcher} from "@remix-run/react";
import {Input} from "@ui/input";
import {FormEvent, useEffect, useState} from "react";
import {Button} from "@ui/button";
import {Bell, MailCheck, Search, X} from "lucide-react";
import Fade from "@ui/fade";
import InboxTable from "@components/table/InboxTable";
import {SlotProps} from "@components/table/DataTable";
import {fetchNotifications} from "@/routes/notifications";
import usePersistedLoaderData from "@/utils/hooks/usePersistedLoaderData";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {useErrorToast, useSuccessToast, useUnknownErrorToast} from "@/utils/toast";

export async function loader({context}: LoaderFunctionArgs) {
  if (!context.user.loggedIn) {
    return redirect('/');
  }

  const notifications = await fetchNotifications(context, context.user.id);

  return json({notifications});
}

export default function InboxRoute() {
  const data = usePersistedLoaderData();
  const fetcher = useFetcher();
  const markFetcher = useFetcher();
  const [notifications, setNotifications] = useState<any[]>(data?.notifications ?? []);
  const [selected, setSelected] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setNotifications(data?.notifications ?? []);
  }, [data?.notifications]);

  useEffect(() => {
    if (markFetcher?.data) {
      if (markFetcher.data.success) {
        useSuccessToast('Marked Notifications Read');
      } else if (markFetcher.data.error) {
        useErrorToast(markFetcher.data.error)
      } else {
        useUnknownErrorToast();
      }
    }
  }, [markFetcher?.data]);

  useEffect(() => {
    if (fetcher?.data) {
      if (fetcher.data.success) {
        useSuccessToast('Dismissed Notifications');
      } else if (fetcher.data.error) {
        useErrorToast(fetcher.data.error)
      } else {
        useUnknownErrorToast();
      }
    }
  }, [fetcher?.data]);

  function onMarkRead(evt: FormEvent) {
    evt.preventDefault();
    const formData = new FormData();

    for (const notification of selected) {
      formData.append('id', notification);
    }

    markFetcher.submit(formData, {
      action: '/notifications/mark/read',
      method: 'POST',
    });
  }

  function onDismiss(evt: FormEvent) {
    evt.preventDefault();
    const formData = new FormData();

    setSelected([]);

    for (const notification of selected) {
      formData.append('id', notification);
    }

    fetcher.submit(formData, {
      action: '/notifications/dismiss',
      method: 'POST',
    });
  }

  function prepend({selected}: SlotProps) {
    const clear = (
      <Fade id="clear" show={!!filter}>
        <Button className="text-gray-400 w-6 h-6 rounded-full" size="icon" variant="ghost"
                onClick={() => setFilter('')}>
          <X size={14}/>
        </Button>
      </Fade>
    );

    return (
      <div className="flex flex-row w-full">
        <Input value={filter}
               onChange={(evt) => setFilter(evt.target.value)}
               className="w-1/3"
               placeholder="Search"
               prepend={<div className="flex justify-center items-center w-6 h-6"><Search size={14}
                                                                                          className="text-gray-400"/>
               </div>}
               append={clear}
        />
        <div className="flex-grow flex justify-end">
          <Fade className="flex gap-2" show={selected && selected.length > 0}>
            <markFetcher.Form onSubmit={onMarkRead}>
              <Button className="flex flex-row items-center gap-2 min-w-[125px]" variant="outline">
                {markFetcher.state !== 'idle' ? <LoadingSpinner/> : <>Mark Read <MailCheck size={14}/></>}
              </Button>
            </markFetcher.Form>
            <fetcher.Form onSubmit={onDismiss}>
              <Button className="flex flex-row items-center gap-2 min-w-[125px]" variant="outline">
                {fetcher.state !== 'idle' ? <LoadingSpinner/> : <>Dismiss <Bell size={14}/></>}
              </Button>
            </fetcher.Form>
          </Fade>
        </div>
      </div>
    )
      ;
  }

  return (
    <div className="p-8 w-full h-full flex flex-col gap-3">
      <InboxTable selected={selected} onSelect={setSelected} notifications={notifications} filter={filter}
                  prepend={prepend}/>
    </div>
  );
}