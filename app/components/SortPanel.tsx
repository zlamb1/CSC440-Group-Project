import {Card} from "@ui/card";
import {Button} from "@ui/button";
import {ChevronUp, ChevronDown} from "lucide-react";
import {Separator} from "@ui/separator";
import React, {CSSProperties, useContext, useState} from "react";
import {cn} from "@/lib/utils";
import {UserContext} from "@/utils/context/UserContext";
import {Genre} from "@prisma/client";
import {GenreTheme} from "@/utils/genre-theme";

function formatGenre(genre: string) {
    // this is necessary because genres from the enum are fully capitalized
    let formattedGenre = '';
    const parts = genre.split('_');
    for (const part of parts) {
        formattedGenre += part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
    }
    return formattedGenre;
}

export default function SortPanel({ className, style }: { className?: string, style?: CSSProperties }) {
    const user = useContext(UserContext);
    const [showContent, setShowContent] = useState(true);

    const toggleContent = () => {
        setShowContent(!showContent);
    };

    if (!user?.loggedIn) {
        return <div className={className} />;
    }

    return (
        <Card className={cn("h-full flex flex-col overflow-hidden", className)} style={style}>
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
                        showContent && Object.keys(Genre)?.map?.((genre: string) => {
                            const color = GenreTheme[genre] || '';
                            return (
                                <Button key={genre} containerClass="w-100" className={"justify-between rounded-full m-1 h-7"} style={{ background: color }} size="sm">
                                    {formatGenre(genre)}
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