import {LoaderFunctionArgs} from "@remix-run/node";
import {Link} from "@remix-run/react";

import {Separator} from "@ui/separator";
import UserAvatar from "@components/user/UserAvatar";
import {Button} from "@ui/button";
import {Follow, Prisma, User} from "@prisma/client";
import NotFound from "@/routes/$";
import {useContext, useRef, useState} from "react";
import FollowButton from "@components/FollowButton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@ui/tabs";
import {LayoutGroup, motion} from "framer-motion";
import UserDisplay from "@components/user/UserDisplay";
import {FollowWithRelations} from "@/utils/types";
import EndpointResponse from "@/api/EndpointResponse";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {useShallow} from "zustand/react/shallow";
import PostScroller from "@components/post/PostScroller";
import useProfilePosts from "@/utils/posts/useProfilePosts";
import usePersistedLoaderData from "@/utils/hooks/usePersistedLoaderData";
import {UserContext} from "@/utils/context/UserContext";
import {getPublicUser} from "@/routes/users.$username.public";
import {isUserPrivate} from "@/routes/users.$id.posts";

export async function loader({context, params}: LoaderFunctionArgs) {
  try {
    if (!params.username) {
      return RequiredFieldResponse('Username');
    }

    const stdProps = {
      id: true,
      userName: true,
      joinedAt: true,
      avatarPath: true,
      role: true,
      visibility: true,
      displayName: true,
      bio: true,
    }

    const user = await context.prisma.user.findUnique({
      select: {
        ...stdProps,
        following: {
          include: {
            following: true,
          },
        },
        followers: {
          include: {
            follower: true,
          }
        },
      },
      where: {
        userName: params.username,
      },
    });

    if (!user) {
      return ExplicitResourceNotFoundResponse('User');
    }

    if (isUserPrivate(user, context.user)) {
      const user = await getPublicUser({userName: params.username, context});
      if (!user) {
        return ExplicitResourceNotFoundResponse('User');
      }
      return EndpointResponse({user, isPrivate: true});
    }

    return EndpointResponse({user, isPrivate: false});
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}

function getFormattedDate(joinedAt: Date) {
  if (!joinedAt) {
    return null;
  }

  joinedAt = new Date(joinedAt);

  const months = [
    "January", "February", "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December"
  ]

  return (
    months[joinedAt.getMonth()] + " " + joinedAt.getDate() + ", " + joinedAt.getFullYear()
  );
}

function FollowRow({follow, user}: { follow: Follow, user: User }) {
  return (
    <Link to={`/users/${user.userName}`}>
      <Button containerClass="w-full flex" className="h-fit flex-grow flex justify-start gap-4" variant="ghost"
              clickAnimationScale={0.99} disableRipple>
        <UserAvatar className="text-2xl" avatar={user.avatarPath} userName={user.userName} size={50}/>
        <div className="flex flex-col">
          <UserDisplay user={user}/>
        </div>
        <div className="text-gray-300">
          Followed Since {getFormattedDate(follow.followedAt)}
        </div>
      </Button>
    </Link>
  );
}

export default function UserRoute() {
  const data = usePersistedLoaderData();
  const [tab, setTab] = useState('posts');

  const self = useContext(UserContext);
  const user = data?.user;
  const following = user?.following;
  const followers = user?.followers;

  const store = useRef(useProfilePosts(user?.id, self?.id));
  const profilePostsStore = store.current?.(useShallow((state: any) => ({
    profileStore: state.profilePosts,
    likedStore: state.likedPosts
  })));
  const profileStore = profilePostsStore?.profileStore?.(useShallow((state: any) => ({
    fetch: state.fetch,
    posts: state.posts
  })));
  const likedStore = profilePostsStore?.likedStore?.(useShallow((state: any) => ({
    fetch: state.fetch,
    posts: state.posts
  })));

  const isOwnPage = self?.id === user?.id;
  const isPrivate = data?.isPrivate;

  if (data?.error && data.error === 'User Not Found') {
    return <NotFound/>;
  }

  const tabs = [
    {
      value: 'posts',
      name: 'Posts',
    },
    {
      value: 'following',
      name: 'Following',
    },
    {
      value: 'followers',
      name: 'Followers',
    },
    {
      value: 'liked',
      name: 'Liked Posts',
    }
  ];

  return (
    <div className="flex-grow flex flex-col gap-3 m-4 ">
      <div className="flex gap-3 select-none items-center m-4">
        <UserAvatar className="text-6xl mx-12 " avatar={user?.avatarPath} userName={user?.userName} size={100}/>
        <div className="flex flex-col mr-8">
          {
            user?.displayName ?
              <>
                <span className="font-bold text-3xl">{user?.displayName}</span>
                <span className="font-bold text-base text-gray-400">@{user?.userName}</span>
              </> :
              <span className="font-bold text-3xl">@{user?.userName}</span>
          }
          <span className="text-sm mt-2" suppressHydrationWarning>{"Joined " + getFormattedDate(user?.joinedAt)}</span>
          {
            user?.bio == null ?
              <span className="text-sm mt-2">This user has not yet set a bio.</span> :
              <span className="text-sm mt-2">{user?.bio}</span>
          }
        </div>
        {
          isOwnPage ? (
            //this Link's classes make it match the look of a button.
            <Link to="/settings"
                  className="flex flex-row gap-1 w-fit items-center justify-center whitespace-nowrap relative overflow-hidden rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-700 shadow-sm hover:bg-blue-700/90 text-white h-9 px-4 py-2">
              Edit Profile
            </Link>
          ) : <FollowButton user={user}/>
        }
      </div>
      {
        isPrivate ?
          <div className="font-bold text-center select-none">Request to follow {user?.userName} to view their
            posts.</div> :
          <Tabs value={tab} className="flex flex-col" onValueChange={setTab}>
            <LayoutGroup id="tabs">
              <TabsList className="flex justify-center bg-transparent">
                {
                  tabs.map(_tab => (
                    <TabsTrigger className="flex flex-col" key={_tab.value} value={_tab.value}>
                      {_tab.name}
                      {_tab.value === tab ?
                        <motion.div className="border w-full border-current" layoutId="tab"/> : null}
                    </TabsTrigger>
                  ))
                }
              </TabsList>
            </LayoutGroup>
            <Separator/>
            <TabsContent className="flex flex-col gap-2" value="posts">
              <PostScroller posts={profileStore?.posts} fetcher={profileStore?.fetch} empty={
                <div className="font-bold select-none text-center mt-8">
                  <span className="text-primary">@{user?.userName}</span> has no posts ¯\_(ツ)_/¯
                </div>
              }/>
            </TabsContent>
            <TabsContent className="flex flex-col gap-2" value="following">
              {
                !following || !following.length ?
                  <div className="font-bold select-none text-center mt-8">
                    <span className="text-primary">@{user?.userName}</span> is not following anyone ¯\_(ツ)_/¯
                  </div> : null
              }
              {
                following?.map((follow: Prisma.FollowGetPayload<{ include: { following: true } }>) =>
                  <FollowRow key={follow.followingId} follow={follow} user={follow.following}/>
                )
              }
            </TabsContent>
            <TabsContent className="flex flex-col gap-2" value="followers">
              {
                !followers || !followers.length ?
                  <div className="font-bold select-none text-center mt-8">
                    <span className="text-primary">@{user?.userName}</span> is not followed by anyone ¯\_(ツ)_/¯
                  </div> : null
              }
              {
                followers?.map((follow: FollowWithRelations) =>
                  <FollowRow key={follow.followerId} follow={follow} user={follow.follower}/>
                )
              }
            </TabsContent>
            <TabsContent className="flex flex-col gap-2" value="liked">
              <PostScroller posts={likedStore?.posts} fetcher={likedStore?.fetch} empty={
                <div className="font-bold select-none text-center mt-8">
                  <span className="text-primary">@{user?.userName}</span> has no liked posts ¯\_(ツ)_/¯
                </div>
              }/>
            </TabsContent>
          </Tabs>
      }
    </div>
  );
}

