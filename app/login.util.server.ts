import {AppLoadContext} from "@remix-run/server-runtime";
import {useUserData} from "@/sessions.server";
import {ActionFunctionArgs, json, TypedResponse} from "@remix-run/node";

async function useLoginFormData(context: AppLoadContext, request: Request) {
    const data = await useUserData(context, request);
    if (data.loggedIn) {
        return json({ error: 'You are already signed in.' });
    }
    const formData = await request.formData();
    const username = String(formData.get("username"));
    const password = String(formData.get("password"));
    return { username, password }
}

export async function useRegisterValidation({context, request}: ActionFunctionArgs, cb: (username: string, password: string) => Promise<TypedResponse>) {
    const { username, password } = await useLoginFormData(context, request);
    const errors: { username?: string, password?: string } = {};
    if (username.length === 0) {
        errors.username = 'Username is required.';
    }
    if (username.length > 25) {
        errors.username = 'Username must be less than 25 characters long.';
    }
    const available = await context.user.isUsernameAvailable(username);
    if (!available) {
        errors.username = 'That username is unavailable.';
    }
    if (password.length === 0) {
        errors.password = 'Password is required.';
    }
    if (Object.keys(errors).length > 0) {
        return json({ errors });
    } else {
        return await cb(username, password);
    }
}

export async function useLoginValidation({context, request}: ActionFunctionArgs, cb: (username: string, password: string) => Promise<TypedResponse>) {
    const { username, password } = await useLoginFormData(context, request);
    const errors: { username?: string, password?: string } = {};
    if (username.length === 0) {
        errors.username = 'Username is required.';
    }
    if (password.length === 0) {
        errors.password = 'Password is required.';
    }
    if (Object.keys(errors).length > 0) {
        return json({ errors });
    } else {
        return cb(username, password);
    }
}