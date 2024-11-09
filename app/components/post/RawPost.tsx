import React, {createRef, useState} from "react";
import useOverflow from "@/utils/hooks/useOverflow";
import {Button} from "@ui/button";

export default function RawPost({ content }: { content: string }) {
    const [ isExpanded, setExpanded ] = useState(false);
    const ref = createRef<HTMLDivElement>();
    const isOverflowing = useOverflow(ref, true, () => {});
    return (
        <>
            <div className={`break-all max-h-[200px] ${isExpanded ? 'overflow-y-scroll' : 'overflow-y-hidden'}`} dangerouslySetInnerHTML={{__html: content}} ref={ref} />
            {
                isOverflowing || isExpanded ? (
                    <Button containerClass="self-center" onClick={ () => setExpanded(!isExpanded) } variant="ghost">
                        {isExpanded ? 'Show less...' : 'Show more...'}
                    </Button>
                ) : null
            }
        </>
    );
}