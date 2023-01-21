"use strict";
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
exports.Query = void 0;
const getUserId_1 = __importDefault(require("../utils/getUserId"));
const mustAuth_1 = require("../utils/mustAuth");
const Query = {
    users(_, { query, skip, take }, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!take)
                take = 5;
            if (!skip)
                skip = 0;
            if (!query) {
                return yield prisma.user.findMany({
                    take,
                    skip,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
            }
            const users = yield prisma.user.findMany({
                where: {
                    name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                take,
                skip,
                orderBy: {
                    createdAt: "asc",
                },
            });
            return users;
        });
    },
    post(_, { id }, { prisma, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAuth = (0, getUserId_1.default)(authToken);
            // find post where published is true OR post belong to author
            const post = yield prisma.post.findFirst({
                where: {
                    id,
                    OR: [
                        {
                            published: true,
                        },
                        {
                            userId: userAuth.userId,
                        },
                    ],
                },
            });
            if (!post) {
                throw new Error(`post not found`);
            }
            return post;
        });
    },
    posts(_, { query, take, skip }, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!take)
                take = 5;
            if (!skip)
                skip = 0;
            if (!query) {
                const posts = yield prisma.post.findMany({
                    where: {
                        published: true,
                    },
                    take,
                    skip,
                });
                return posts;
            }
            const posts = yield prisma.post.findMany({
                where: {
                    published: true,
                    OR: [
                        {
                            title: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            body: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                take,
                skip,
            });
            return posts;
        });
    },
    myPosts(_, { query, take, skip }, { prisma, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAuth = (0, getUserId_1.default)(authToken);
            if (!userAuth.userAuthenticated) {
                throw new Error("Authentication Required");
            }
            if (!take)
                take = 5;
            if (!skip)
                skip = 0;
            if (!query) {
                return yield prisma.post.findMany({
                    where: {
                        userId: userAuth.userId,
                    },
                    take,
                    skip,
                });
            }
            return yield prisma.post.findMany({
                where: {
                    userId: userAuth.userId,
                    OR: [
                        {
                            title: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            body: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                take,
                skip,
            });
        });
    },
    comments(_, __, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield prisma.comment.findMany();
            return comments;
        });
    },
    me(_, __, { prisma, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAuth = (0, mustAuth_1.mustAuth)(authToken);
            if (!userAuth.userAuthenticated) {
                throw new Error(userAuth.error);
            }
            const user = yield prisma.user.findFirst({
                where: {
                    id: userAuth.userId,
                },
            });
            return user;
        });
    },
};
exports.Query = Query;
