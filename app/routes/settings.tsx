import {Separator} from "@ui/separator";
import {Link, Outlet, useLocation} from "@remix-run/react";
import {LoaderFunctionArgs, redirect} from "@remix-run/node";
import {capitalizeWord} from "@/utils/text-fmt";
import {cn} from "@/lib/utils";

const settingsRoutes = ['profile', 'notifications'];

const isProduction = process.env.NODE_ENV === "production";

export async function loader({request}: LoaderFunctionArgs) {
  /* redirect the user back to home page if they try to route to an invalid settings route */
  const url = new URL(request.url);
  const pathname = url.pathname;
  const segments = pathname.split("/");
  const lastSegment = segments[segments.length - 1];
  if (!settingsRoutes.includes(lastSegment)) {
    return redirect('/');
  }
  return null;
}

export default function SettingsRoute() {
  const {pathname} = useLocation();
  const segments = pathname.split('/');
  const lastSegment = segments[segments.length - 1];

  return (
    <div className="flex-grow flex flex-col gap-3 m-4">
      <span className="text-xl font-medium select-none">{capitalizeWord(lastSegment)} Settings</span>
      <Separator/>
      <div className="flex-grow flex gap-1">
        <div className="flex flex-col gap-1">
          {
            settingsRoutes.map(route => {
              const isCurrent = route === lastSegment;
              return <Link key={route} to={`/settings/${route}`}
                           className={cn("font-medium text-muted-foreground hover:text-current", isCurrent && 'text-current')}
                           style={{transition: 'color 0.25s ease-in-out'}}
              >
                {capitalizeWord(route)}
              </Link>
            })
          }
        </div>
        <div className="flex-grow mx-8">
          <Outlet/>
        </div>
      </div>
    </div>
  );
}