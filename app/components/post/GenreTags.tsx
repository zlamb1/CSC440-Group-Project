import {Badge} from "@ui/badge";
import {formatGenre, GenreThemes} from "@/utils/genre-util";
import {Button} from "@ui/button";
import {Check, Plus, X} from "lucide-react";
import {ReactNode, useContext, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@ui/command";
import {Genre} from "@prisma/client";
import {PostContext} from "@/utils/context/PostContext";

export function GenreCommand({ children, genres }: { children: ReactNode, genres: string[] }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const post = useContext(PostContext);

    const allGenres = Object.keys(Genre);

    function onClickGenre(genre: string) {

    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                { children }
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search Genres..." />
                    <CommandList>
                        <CommandEmpty>No genres found.</CommandEmpty>
                        <CommandGroup>
                            {
                                allGenres.map(genre => (
                                    <CommandItem key={genre} className="flex justify-between cursor-pointer" value={genre} onSelect={() => onClickGenre(genre)}>
                                        {formatGenre(genre)}
                                        { genres.includes(genre) && <Check /> }
                                    </CommandItem>
                                ))
                            }
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default function GenreTags({ genres, editable = true }: { genres: string[], editable?: boolean }) {
    if (!genres || !genres.length) {
        return null;
    }

    return (
        <div className="flex items-center gap-1">
            {
                genres?.map?.(genre => (
                    <Badge key={genre} className="flex items-center gap-1" style={{ background: GenreThemes[genre] }}>
                        {formatGenre(genre)}
                        {
                            editable && (
                                <Button className="w-[16px] h-[16px]" variant="ghost" size="icon" style={{ background: GenreThemes[genre] }}>
                                    <X size={14} />
                                </Button>
                            )
                        }
                    </Badge>
                ))
            }
            {
                editable && (
                    <GenreCommand genres={genres}>
                        <Button className="w-[24px] h-[24px]" variant="ghost" size="icon">
                            <Plus size={14} />
                        </Button>
                    </GenreCommand>
                )
            }
        </div>
    );
}