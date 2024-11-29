import {Card} from "@ui/card";
import {Button} from "@ui/button";
import {ChevronDown, ChevronUp, Search, X} from "lucide-react";
import {Separator} from "@ui/separator";
import React, {CSSProperties, useContext, useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {UserContext} from "@/utils/context/UserContext";
import Expand from "@ui/expand";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import PostSearch from "@components/post/PostSearch";
import {Checkbox} from "@ui/checkbox";
import {Label} from "@ui/label";

export default function SortPanel({className, style}: { className?: string, style?: CSSProperties }) {
  const user = useContext(UserContext);
  const [showContent, setShowContent] = useState<boolean>(true);
  const [filter, setFilter] = useState<string | undefined>('');
  const [isLiked, setIsLiked] = useState<boolean | null | undefined>();
  const {_filter} = usePostStore(useShallow((state: any) => ({_filter: state?.filter})));

  const lastCharIsSpace = filter?.substring?.(filter?.length - 1) === ' ';

  useEffect(() => {
    let modifiedFilter = filter;

    if (isLiked !== undefined) {
      modifiedFilter += (lastCharIsSpace ? '' : ' ') + `liked::${isLiked}`;
    }

    _filter({filter: modifiedFilter});
  }, [filter, isLiked]);

  const toggleContent = () => {
    setShowContent(!showContent);
  };

  if (!user?.loggedIn) {
    return <div className={className}/>;
  }

  return (
    <Card className={cn("h-full flex flex-col overflow-hidden", className)} style={style}>
      <Button containerClass="w-full" className="w-full flex justify-between px-3 py-2 items-center" variant="ghost"
              onClick={toggleContent} noClickAnimation>
        <span className="font-bold select-none">Search</span>
        {showContent ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </Button>
      <Separator/>
      <Expand className="w-full flex flex-col gap-1 overflow-hidden" show={showContent}>
        <div className="flex flex-col gap-2 p-2">
          <PostSearch prepend={<Search className="text-muted-foreground" size={18}/>}
                      append={filter &&
                        <Button className="text-muted-foreground rounded-full w-7 h-7" size="icon" variant="ghost"
                                onClick={() => setFilter('')}><X size={18}/></Button>}
                      value={filter}
                      onChange={setFilter}
                      placeholder="Search Posts"
          />
          <Label className="flex justify-between font-bold">
            Liked
            <Checkbox checked={isLiked === true}
                      onCheckedChange={() => setIsLiked(isLiked === true ? undefined : true)}/>
          </Label>
          <Label className="flex justify-between font-bold">
            Disliked
            <Checkbox checked={isLiked === false}
                      onCheckedChange={() => setIsLiked(isLiked === false ? undefined : false)}/>
          </Label>
        </div>
      </Expand>
    </Card>
  );
}