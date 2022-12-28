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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mustAuth_1 = require("../utils/mustAuth");
const Subscription = {
    comment: {
        subscribe(_, { postId }, { prisma, pubsub }) {
            return __awaiter(this, void 0, void 0, function* () {
                // find the post id we want to subscribe to
                const post = yield prisma.post.findFirst({
                    where: {
                        id: postId,
                    },
                });
                if (!post) {
                    throw new Error(`post with id = ${postId} not found`);
                }
                return pubsub.asyncIterator(`commentOnPostWithID=${postId}`);
            });
        },
    },
    post: {
        subscribe(_, __, { pubsub }) {
            return pubsub.asyncIterator(`post`);
        },
    },
    myPost: {
        subscribe(_, __, { pubsub, prisma, authToken }) {
            const userAuth = (0, mustAuth_1.mustAuth)(authToken);
            console.log(`postForUserID=${userAuth.userId}`);
            return pubsub.asyncIterator(`postForUserID=${userAuth.userId}`);
        },
    },
};
exports.Subscription = Subscription;
