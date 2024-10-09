export default function UserAvatar({ className, avatar, userName }: { className?: string, avatar?: any, userName: string }) {
    return (
        <div className={"flex justify-center items-center bg-primary rounded-full w-[25px] h-[25px] select-none font-medium text-white " + className}>
            {userName?.substring(0, 1).toUpperCase()}
        </div>
    );
}