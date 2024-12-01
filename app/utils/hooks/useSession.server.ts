import {AppLoadContext} from "@remix-run/node";

export async function useSession(context: AppLoadContext, request: Request) {
  const session = await context.session.getSession(request.headers.get("Cookie"));
  return {session}
}