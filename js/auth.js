import {createCookie, createSessionStorage} from "@remix-run/node";
import {createData, deleteData, readData, updateData} from "./db/sessions.js";
import {getUser} from "./db/users.js";

export const cookie = createCookie('__session', {
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

export async function useUserData(req, res){
    const session = await getSession(req.headers.cookie);
    const userId = session.get('userId');
    if (!userId) {
        return { data: { loggedIn: false }, session }
    }
    const data = await getUser(userId);
    if (!data) {
        return { data: { loggedIn: false }, session }
    }
    data.loggedIn = true;
    return {
        data, session,
    }
}