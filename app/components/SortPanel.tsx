import {Card} from "@ui/card";
import {Button} from "@ui/button";
import {ChevronUp, ChevronDown} from "lucide-react";
import {Separator} from "@ui/separator";
import React, {useState} from "react";
import {FollowWithFollowing, UserWithLoggedIn} from "@/utils/types";
import {cn} from "@/lib/utils";
import {Link} from "@remix-run/react";

export default function SortPanel({ className, user }: { className?: string, user: UserWithLoggedIn, }) {
    if (!user?.loggedIn) {
        return <div className={className} />;
    }

    //PROBABLY TEMPORARY - WOULD BE BETTER TO GET THIS OUT OF DATABASE 
    const genres = [
        {genre: 'Comedy',   id: 0,  color: 'yellow'},
        {genre: 'SciFi',    id: 1,  color: 'lime'},
        {genre: 'Thriller', id: 2,  color: 'purple'},
        {genre: 'Romance',  id: 3,  color: 'red'},
        {genre: 'Fantasy',  id: 4,  color: 'blue'}
    ];

    const [showContent, setShowContent] = useState(true);

    const toggleContent = () => {
        setShowContent(!showContent);
    };

    return (
        <Card className={cn("h-full flex flex-col overflow-hidden", className)}>
            <div className="flex justify-between px-3 py-2 items-center">
                <span className="font-bold select-none">Sort By</span>
                <Button className="w-[20px] h-[20px]" size="icon" variant="ghost" onClick={ toggleContent }>
                    { showContent ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                  
                </Button>
            </div>
            <Separator />
            {
                showContent &&
                <div className="px-3 py-2 w-full flow-root">
                    <span className="font-bold select-none opacity-70 text-sm mx-1">Genre</span>
                    <div className="w-full flex flex-row flex-wrap">
                    {
                        showContent && genres?.map((value: {genre: string, id: number, color: string}) => {
                            return (
                                <Button containerClass="w-100" className={"justify-between rounded-full bg-" + value.color + "-400 hover:bg-" + value.color + "-500 hover:text-white text-white m-1 h-7"} key={value.id} variant="ghost" size="sm">
                                    {value.genre}
                                </Button>
                            );
                        })
                    }
                    </div>
                </div>
            }

        </Card>
    )
}