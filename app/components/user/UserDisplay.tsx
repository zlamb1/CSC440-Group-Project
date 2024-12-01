import {User} from "@prisma/client";

export default function UserDisplay({user}: { user?: User | null }) {
  return (
    user?.displayName ?
      <>
        <span className="font-bold text-xl">{user?.displayName}</span>
        <span className="font-bold text-base text-gray-400">@{user?.userName}</span>
      </> :
      <span className="font-bold text-xl">@{user?.userName}</span>
  );
}