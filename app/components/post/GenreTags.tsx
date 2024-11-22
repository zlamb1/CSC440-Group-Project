import {Badge} from "@ui/badge";
import {formatGenre, GenreThemes} from "@/utils/genre-util";
import {Button} from "@ui/button";
import {Check, Plus, X} from "lucide-react";
import {Fragment, ReactNode, useContext, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@ui/command";
import {Genre} from "@prisma/client";
import {PostContext} from "@/utils/context/PostContext";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import {AnimatePresence, motion} from "framer-motion";
import {LoadingSpinner} from "@components/LoadingSpinner";

export function GenreCommand({ children, genres, loadingGenres, onUpdateGenre }:
    { children: ReactNode, genres: string[], loadingGenres: any, onUpdateGenre: (_genre: string, remove?: boolean) => void }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const allGenres = Object.keys(Genre);

    function onClickGenre(_genre: string) {
        onUpdateGenre(_genre, genres.includes(_genre));
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
                                    <CommandItem key={genre}
                                                 className="flex justify-between cursor-pointer"
                                                 value={genre}
                                                 onSelect={() => onClickGenre(genre)}
                                                 disabled={loadingGenres[genre]}
                                    >
                                        { formatGenre(genre) }
                                        { (loadingGenres[genre] && <LoadingSpinner />) || (genres.includes(genre) && <Check />) }
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
    const [loadingGenres, setLoadingGenres] = useState<any>({});
    const post = useContext(PostContext);
    const {genre} = usePostStore(useShallow((state: any) => ({ genre: state.genre })));

    if (!post) {
        return null;
    }

    function onUpdateGenre(_genre: string, remove?: boolean) {
        if (!remove) remove = false;

        const formData = new FormData();
        formData.append("genre", _genre);
        formData.append("delete", remove?.toString?.());

        setLoadingGenres((prev: any) => ({...prev, [_genre]: true}));
        fetch(`/posts/${post!.id}/genre`, {
            method: 'POST',
            body: formData
        }).then(async res => {
            res.json().then(json => {
                if (json.success) {
                    genre({ post: post!.id, genre: _genre, remove });
                }
            });
        }).finally(() => {
            setLoadingGenres((prev: any) => ({...prev, [_genre]: false}));
        });
    }

    function onRemoveGenre(_genre: string) {
        onUpdateGenre(_genre, true);
    }

    return (
        <Fragment>
            {
                editable && (
                    <GenreCommand genres={genres} loadingGenres={loadingGenres} onUpdateGenre={onUpdateGenre}>
                        <Button className="w-[24px] h-[24px]" variant="ghost" size="icon">
                            <Plus size={14}/>
                        </Button>
                    </GenreCommand>
                )
            }
            <AnimatePresence>
                {
                    genres?.map?.(genre => (
                        <motion.div initial={{width: 0}}
                                    animate={{width: 'auto'}}
                                    exit={{width: 0}}
                                    transition={{duration: 0.15}}
                                    className="overflow-x-hidden flex-shrink-0"
                                    key={genre}
                        >
                            <Badge className="flex items-center gap-1" style={{background: GenreThemes[genre]}}>
                                <span className="select-none">{formatGenre(genre)}</span>
                                {
                                    editable && (
                                        <Button className="w-[16px] h-[16px]"
                                                variant="ghost"
                                                size="icon"
                                                style={{background: GenreThemes[genre]}}
                                                onClick={() => onRemoveGenre(genre)}
                                                disabled={loadingGenres[genre]}
                                        >
                                            { (loadingGenres[genre] && <LoadingSpinner size={14} />) || <X size={14} /> }
                                        </Button>
                                    )
                                }
                            </Badge>
                        </motion.div>
                    ))
                }
            </AnimatePresence>
        </Fragment>
    );
}