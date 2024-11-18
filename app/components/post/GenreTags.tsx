import {Badge} from "@ui/badge";
import {formatGenre, GenreThemes} from "@/utils/genre-util";
import {Button} from "@ui/button";
import {Plus, X} from "lucide-react";

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
                    <Button className="w-[24px] h-[24px]" variant="ghost" size="icon"><Plus size={14} /></Button>
                )
            }
        </div>
    );
}