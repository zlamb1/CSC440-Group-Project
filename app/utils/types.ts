import {User} from "@prisma/client";

export type UserWithLoggedIn = User & { loggedIn: boolean }