import {createCookie, createSessionStorage} from "@remix-run/node";
import {createData, deleteData, readData, updateData} from "./db/sessions.js";
import {getUser} from "./db/users.js";

const cookie = createCookie('__session', {
    httpOnly: true,
    // lasts three days
    maxAge: 60 * 60 * 24 * 3,
    path: "/",
    sameSite: "lax",
    // TODO: rotate secrets
    secrets: ["s3cret1"],
    secure: true,
});

export const { getSession, commitSession, destroySession } = createSessionStorage({
    cookie,
    createData,
    readData,
    updateData,
    deleteData
})

export async function useUserData(request){
    const session = await getSession(request.headers.cookie);
    const userId = session.get('userId');
    if (!userId) {
        return { loggedIn: false }
    }
    const data = await getUser(userId);
    if (!data) {
        return { loggedIn: false }
    }
    return {
        loggedIn: true,
        id: data.id,
        userName: data.user_name,
        joinedAt: data.joined_at,
        avatarPath: data.avatar_path,
    }
}