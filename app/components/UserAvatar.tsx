export interface UserAvatarProps {
    className?: string,
    avatar?: any,
    userName: string,
    size?: number | string,
}

export default function UserAvatar({ className, avatar, userName, size = 25 }: UserAvatarProps) {
    return (
        <div className={`flex justify-center items-center bg-primary rounded-full select-none font-medium text-white ` + (className ?? '')}
             style={{ width: size, height: size }}>
            {userName?.substring(0, 1).toUpperCase()}
        </div>
    );
}