import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import bodyParser, { json } from "body-parser";
import cors from "cors";
import { readFileSync } from "fs";
import {
  Query,
  Post,
  User,
  Comment,
  Mutation,
  Subscription,
} from "./resolvers/index";
import { PubSub } from "graphql-subscriptions";
import { PrismaClient, Prisma } from "@prisma/client";

// create new pubsub instance
export const pubsub = new PubSub();

// prisma client
export const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;

  pubsub: PubSub;

  authToken: string | undefined;
}

// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({
  typeDefs: readFileSync("./src/schema.graphql", "utf-8"),
  resolvers: {
    Query,
    Mutation,
    Subscription,
    Post,
    User,
    Comment,
  },
});

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx, _, __) => {
      return {
        pubsub,
        prisma,
        authToken: ctx.connectionParams
          ? (ctx.connectionParams.Authorization as string)
          : undefined,
      };
    },
  },
  wsServer
);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  introspection: true,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

const start = async function () {
  await server.start();
};

start().then(() => {
  app.use(
    "/graphql",
    json(),
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        return {
          pubsub,
          prisma,
          authToken: req.headers.authorization,
        };
      },
    })
  );
});

export { httpServer as default };
