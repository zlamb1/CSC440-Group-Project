import {createContext} from "react";
import {UserWithLoggedIn} from "@/utils/types";

export const UserContext = createContext<UserWithLoggedIn | null>(null);