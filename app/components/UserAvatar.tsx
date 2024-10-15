export interface UserAvatarProps {
    className?: string,
    avatar?: any,
    userName: string,
    size?: number | string,
}

export default function UserAvatar({ className, avatar, userName, size = 25 }: UserAvatarProps) {
    return (
        <div className={`flex justify-center items-center ${avatar ? '' : 'bg-primary'} rounded-full select-none font-medium text-white ` + (className ?? '')}
             style={{ width: size, height: size }}>
            {
                avatar ?
                    <img src={avatar} alt="Profile avatar" />
                    : userName?.substring(0, 1).toUpperCase()
            }

        </div>
    );
}