"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.prisma = exports.pubsub = void 0;
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const http_1 = require("http");
const schema_1 = require("@graphql-tools/schema");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const body_parser_1 = __importStar(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = require("fs");
const index_1 = require("./resolvers/index");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const client_1 = require("@prisma/client");
// create new pubsub instance
exports.pubsub = new graphql_subscriptions_1.PubSub();
// prisma client
exports.prisma = new client_1.PrismaClient();
// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = (0, schema_1.makeExecutableSchema)({
    typeDefs: (0, fs_1.readFileSync)("./src/schema.graphql", "utf-8"),
    resolvers: {
        Query: index_1.Query,
        Mutation: index_1.Mutation,
        Subscription: index_1.Subscription,
        Post: index_1.Post,
        User: index_1.User,
        Comment: index_1.Comment,
    },
});
// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
exports.default = httpServer;
// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new ws_1.WebSocketServer({
    server: httpServer,
    path: "/graphql",
});
// Save the returned server's info so we can shutdown this server later
const serverCleanup = (0, ws_2.useServer)({
    schema,
    context: (ctx, _, __) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            pubsub: exports.pubsub,
            prisma: exports.prisma,
            authToken: ctx.connectionParams
                ? ctx.connectionParams.Authorization
                : undefined,
        };
    }),
}, wsServer);
// Set up ApolloServer.
const server = new server_1.ApolloServer({
    schema,
    csrfPrevention: true,
    introspection: true,
    plugins: [
        // Proper shutdown for the HTTP server.
        (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
        // Proper shutdown for the WebSocket server.
        {
            serverWillStart() {
                return __awaiter(this, void 0, void 0, function* () {
                    return {
                        drainServer() {
                            return __awaiter(this, void 0, void 0, function* () {
                                yield serverCleanup.dispose();
                            });
                        },
                    };
                });
            },
        },
    ],
});
const start = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield server.start();
    });
};
start().then(() => {
    app.use("/graphql", (0, body_parser_1.json)(), (0, cors_1.default)(), body_parser_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                pubsub: exports.pubsub,
                prisma: exports.prisma,
                authToken: req.headers.authorization,
            };
        }),
    }));
});
