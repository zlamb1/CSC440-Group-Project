declare module "@remix-run/server-runtime" {
  interface AppLoadContext {
    user: any;
    session: any;
    posts: any;
  }
}