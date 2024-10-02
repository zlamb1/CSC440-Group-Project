import {AppLoadContext, Session} from "@remix-run/node";

export async function useSession(context: AppLoadContext, request: Request) {
    const session = await context.session.getSession(request.headers.get("Cookie"));
    return { session }
}

interface UserData {
    loggedIn: boolean;
    id?: string;
    userName?: string;
    joinedAt?: string;
}

export async function useUserData(context: AppLoadContext, request: Request): Promise<UserData> {
    const { session } = await useSession(context, request);
    const userId = session.get('userId');
    if (!userId) {
        return { loggedIn: false }
    }
    const data = await context.user.getUser(userId);
    if (!data) {
        return { loggedIn: false }
    }
    return {
        loggedIn: true,
        id: data.id,
        userName: data.user_name,
        joinedAt: data.joined_at,
    }
}