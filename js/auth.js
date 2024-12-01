import {createCookie, createSessionStorage} from "@remix-run/node";

export const cookie = createCookie('__session', {
  httpOnly: true,
  // lasts one week
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax",
  // TODO: rotate secrets
  secrets: ["s3cret1"],
  secure: true,
});

export const cookieUserID = 'user_id';

export function createPrismaSessionStorage(prisma) {
  return createSessionStorage({
    cookie,
    async createData(data, expiresAt) {
      const session = await prisma.session.create({
        data: {
          userId: data[cookieUserID],
          expiresAt,
          data,
        }
      })

      return session.id;
    },
    async readData(id) {
      const session = await prisma.session.findUnique({
        where: {
          id
        }
      });

      if (!session) {
        return null;
      }

      return session.data;
    },
    async updateData(id, data, expiresAt) {
      await prisma.session.update({
        data: {
          data,
          expiresAt,
        },
        where: {
          id
        },
      });
    },
    async deleteData(id) {
      await prisma.session.delete({
        where: {
          id
        }
      });
    }
  });
}

export async function useUserSession(req, prisma, getSession) {
  const session = await getSession(req.headers.cookie);
  const id = session.get(cookieUserID);

  if (id) {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        userName: true,
        joinedAt: true,
        avatarPath: true,
        role: true,
        visibility: true,
        displayName: true,
        bio: true,
        birthDate: true,
        sentRequests: true,
        following: {
          include: {
            following: true,
          },
        },
      },
      where: {
        id
      }
    });

    if (user) {
      user.loggedIn = true;
      // remap follow requests so that we do not serialize BigInt
      user.sentRequests = user.sentRequests?.map?.(request => ({...request, id: request.id?.toString?.()}));
      return {session, user}
    } else {
      return {
        session,
        user: {
          loggedIn: false,
        },
      }
    }
  } else {
    return {
      session,
      user: {
        loggedIn: false,
      },
    }
  }
}