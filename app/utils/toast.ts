import {ReactNode} from "react";
import {ExternalToast, toast} from "sonner";

export function useSuccessToast(message: string | ReactNode, data?: ExternalToast) {
  toast.success(message, {
    position: 'top-center',
    className: 'bg-green-400 justify-center',
    ...data,
  });
}

export function useErrorToast(message: string | ReactNode, data?: ExternalToast) {
  toast.error('Error', {
    position: 'top-center',
    className: 'bg-red-400',
    description: message,
    ...data,
  });
}

export function useUnknownErrorToast(data?: ExternalToast) {
  toast.error('Unknown Error', {
    position: 'top-center',
    className: 'bg-red-400 justify-center',
    ...data,
  });
}