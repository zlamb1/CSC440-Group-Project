import {Card} from "@ui/card";
import {Button} from "@ui/button";
import {ChevronDown, ChevronUp, Info, Search, X} from "lucide-react";
import {Separator} from "@ui/separator";
import React, {CSSProperties, Fragment, useContext, useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {UserContext} from "@/utils/context/UserContext";
import Expand from "@ui/expand";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import PostSearch from "@components/post/search/PostSearch";

export default function SearchPanel({className, style}: { className?: string, style?: CSSProperties }) {
  const user = useContext(UserContext);
  const [showContent, setShowContent] = useState<boolean>(true);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [filter, setFilter] = useState<string | undefined>('');
  const {_filter} = usePostStore(useShallow((state: any) => ({_filter: state?.filter})));

  useEffect(() => {
    _filter({filter});
  }, [filter]);

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
      <Expand className="w-full flex flex-col gap-1 overflow-hidden" show={showContent} initial={false}>
        <div className="flex flex-col gap-2 p-2">
          <PostSearch prepend={<Search className="text-muted-foreground" size={18}/>}
                      append={
                        <Fragment>
                          <Button className="w-6 h-6" size="icon" variant="ghost"
                                  onClick={(evt) => {
                                    evt.stopPropagation();
                                    setShowInfo(prev => !prev)
                                  }}>
                            <Info size={16}/>
                          </Button>
                          {
                            filter &&
                            <Button className="text-muted-foreground rounded-full w-7 h-7" size="icon" variant="ghost"
                                    onClick={() => setFilter('')}>
                              <X size={18}/>
                            </Button>
                          }
                        </Fragment>
                      }
                      value={filter}
                      onChange={setFilter}
                      placeholder="Search Posts"
          />
          <Expand show={showInfo} initial={false}>
            <p className="text-sm text-muted-foreground">
              The search box can be used to search the content of a post, or be used to search various attributes such
              as (liked, genres, replies, likes).
            </p>
          </Expand>
        </div>
      </Expand>
    </Card>
  );
}