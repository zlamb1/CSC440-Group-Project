import {createContext} from "react";
import {PostWithReplies} from "@/utils/types";

export const PostContext = createContext<PostWithReplies | null>(null);