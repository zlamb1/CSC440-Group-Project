import 'dotenv/config'
import express from 'express';
import {createServer} from "./js/server.js";
import {createRequestHandler} from "@remix-run/express";
import * as vite from "vite";
import {installGlobals} from "@remix-run/node";
import {PrismaClient} from '@prisma/client'
import {cookieUserID, createPrismaSessionStorage, useUserSession} from "./js/auth.js";
import bcrypt from "bcrypt";

installGlobals();

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

// derive IP from X-Forwarded header
// allows obtaining source IP behind reverse proxy
app.enable('trust proxy');

let viteServer;
if (!isProduction) {
  viteServer = await vite.createServer({
    server: {middlewareMode: true}
  });
}

app.use(viteServer ? viteServer.middlewares : express.static('build/client'));

const prisma = new PrismaClient();
const {getSession, commitSession, destroySession} = createPrismaSessionStorage(prisma);

const build = viteServer ? () => viteServer.ssrLoadModule(
  "virtual:remix/server-build") : await import("./build/server/index.js");

app.all("*", createRequestHandler({
  build, async getLoadContext(req, res) {
    const {session, user} = await useUserSession(req, prisma, getSession);

    if (user.loggedIn) {
      // update session expiration on request
      res.setHeader('Set-Cookie', await commitSession(session));
    }

    return {
      user, prisma,
      bcrypt: {
        async compare(password, hash) {
          return await bcrypt.compare(password, hash);
        },
        async hash(password, saltRounds) {
          return await bcrypt.hash(password, saltRounds ?? 10);
        }
      },
      cookieProperty: {
        userID: cookieUserID,
      },
      session: {
        getSession, commitSession, destroySession
      },
    }
  }
}));

createServer(app);