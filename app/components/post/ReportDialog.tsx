import {ChangeEvent, ReactNode, useContext, useEffect, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@ui/dialog";
import {Button} from "@ui/button";
import {Textarea} from "@ui/textarea";
import {useFetcher} from "@remix-run/react";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {PostContext} from "@/utils/context/PostContext";
import {useErrorToast, useSuccessToast, useUnknownErrorToast} from "@/utils/toast";

export default function ReportDialog({children}: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const fetcher = useFetcher();
  const post = useContext(PostContext);

  useEffect(() => {
    if (fetcher?.data) {
      if (fetcher.data.success) {
        useSuccessToast('Reported Story');
        setIsOpen(false);
      } else if (fetcher.data.error) {
        useErrorToast(fetcher.data.error);
      } else {
        useUnknownErrorToast();
      }
    }
  }, [fetcher?.data]);

  if (!post || !post.id) {
    return null;
  }

  function onChange(evt: ChangeEvent<HTMLTextAreaElement>) {
    if (evt.target.value.length <= 200) {
      setValue(evt.target.value);
    }
  }

  function onSubmit() {
    const formData = new FormData();
    formData.set('description', value);
    fetcher.submit(formData, {
      action: `/posts/${post!.id}/report`,
      method: 'POST',
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Story</DialogTitle>
          <DialogDescription>Please share a brief description of why you are reporting this story.</DialogDescription>
        </DialogHeader>
        <div>
          <Textarea value={value} onChange={onChange}
                    placeholder="Type your description here."/>
        </div>
        <DialogFooter className="w-full flex items-center justify-between">
          <div className="w-full text-left text-xs font-medium select-none">{value.length} / 200</div>
          <Button className="flex justify-center min-w-[150px]" variant="destructive" onClick={onSubmit}>
            {fetcher.state === 'idle' ? 'Submit Report' : <LoadingSpinner/>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}