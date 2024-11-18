import {Badge} from "@ui/badge";
import {formatGenre, GenreThemes} from "@/utils/genre-util";
import {Button} from "@ui/button";
import {Check, Plus, X} from "lucide-react";
import {ReactNode, useContext, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@ui/command";
import {Genre} from "@prisma/client";
import {PostContext} from "@/utils/context/PostContext";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import {AnimatePresence, motion} from "framer-motion";

export function GenreCommand({ children, genres }: { children: ReactNode, genres: string[] }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const post = useContext(PostContext);
    const {genre} = usePostStore(useShallow((state: any) => ({ genre: state.genre })))

    if (!post) {
        return null;
    }

    const allGenres = Object.keys(Genre);

    function onClickGenre(_genre: string) {
        const remove = genres.includes(_genre);
        genre({ post: post!.id, genre: _genre, remove });
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

    const post = useContext(PostContext);
    const {genre} = usePostStore(useShallow((state: any) => ({ genre: state.genre })))

    function onRemoveGenre(_genre: string) {
        genre({ post: post!.id, genre: _genre, remove: true });
    }

    return (
        <div className="flex items-center gap-1">
            <AnimatePresence>
                {
                    genres?.map?.(genre => (
                        <motion.div initial={{ width: 0 }}
                                    animate={{ width: 'auto' }}
                                    exit={{ width: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-x-hidden"
                                    key={genre}
                        >
                            <Badge className="flex items-center gap-1" style={{ background: GenreThemes[genre] }}>
                                {formatGenre(genre)}
                                {
                                    editable && (
                                        <Button className="w-[16px] h-[16px]"
                                                variant="ghost"
                                                size="icon"
                                                style={{ background: GenreThemes[genre] }}
                                                onClick={() => onRemoveGenre(genre)}
                                        >
                                            <X size={14} />
                                        </Button>
                                    )
                                }
                            </Badge>
                        </motion.div>
                    ))
                }
            </AnimatePresence>
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