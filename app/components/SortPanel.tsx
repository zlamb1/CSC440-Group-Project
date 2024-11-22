import {Card} from "@ui/card";
import {Button} from "@ui/button";
import {ChevronUp, ChevronDown, Search, X} from "lucide-react";
import {Separator} from "@ui/separator";
import React, {CSSProperties, useContext, useState} from "react";
import {cn} from "@/lib/utils";
import {UserContext} from "@/utils/context/UserContext";
import {Genre} from "@prisma/client";
import {formatGenre, GenreThemes} from "@/utils/genre-util";
import Expand from "@ui/expand";
import {Input} from "@ui/input";

export default function SortPanel({ className, style }: { className?: string, style?: CSSProperties }) {
    const user = useContext(UserContext);
    const [showContent, setShowContent] = useState<boolean>(true);
    const [filter, setFilter] = useState<string>('');

    const toggleContent = () => {
        setShowContent(!showContent);
    };

    if (!user?.loggedIn) {
        return <div className={className} />;
    }

    return (
        <Card className={cn("h-full flex flex-col overflow-hidden", className)} style={style}>
            <Button containerClass="w-full" className="w-full flex justify-between px-3 py-2 items-center" variant="ghost" onClick={toggleContent} noClickAnimation>
                <span className="font-bold select-none">Sort</span>
                { showContent ? <ChevronUp size={16} /> : <ChevronDown size={16} /> }
            </Button>
            <Separator />
            <Expand className="w-full flex flex-col gap-1 overflow-hidden" show={showContent}>
                <div className="p-2">
                    <Input prepend={<Search className="text-muted-foreground" size={16} />}
                           append={filter && <Button className="rounded-full w-6 h-6" size="icon" variant="ghost" onClick={() => setFilter('')}><X size={16} /></Button>}
                           value={filter}
                           onChange={(e) => setFilter(e?.target?.value)}
                           placeholder="Search Posts"
                    />
                    <span className="font-bold select-none opacity-70 text-sm mx-1">Genre</span>
                    <div className="w-full flex flex-wrap">
                        {
                            showContent && Object.keys(Genre)?.map?.((genre: string) => {
                                const color = GenreThemes[genre] || '';
                                return (
                                    <Button key={genre}
                                            containerClass="min-w-[100px] flex justify-center"
                                            className={"w-full rounded-full-center m-1 h-7"}
                                            style={{background: color}}
                                            size="sm"
                                    >
                                        {formatGenre(genre)}
                                    </Button>
                                );
                            })
                        }
                    </div>
                </div>
            </Expand>
        </Card>
    );
}