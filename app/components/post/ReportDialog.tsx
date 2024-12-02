import {ChangeEvent, ReactNode, useState} from "react";
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

export default function ReportDialog({children}: { children: ReactNode }) {
  const [value, setValue] = useState<string>('');

  function onChange(evt: ChangeEvent<HTMLTextAreaElement>) {
    if (evt.target.value.length <= 200) {
      setValue(evt.target.value);
    }
  }

  return (
    <Dialog>
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
          <Button variant="destructive">Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}