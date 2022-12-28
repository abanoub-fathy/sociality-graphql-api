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
exports.Post = void 0;
const Post = {
    author(parent, _, { prisma, pubsub }) {
        return __awaiter(this, void 0, void 0, function* () {
            // return post author
            return yield prisma.user.findUnique({
                where: {
                    id: parent.userId,
                },
            });
        });
    },
    comments(parent, _, { prisma, pubsub }) {
        return __awaiter(this, void 0, void 0, function* () {
            // return post comments
            return yield prisma.comment.findMany({
                where: {
                    postId: parent.id,
                },
            });
        });
    },
};
exports.Post = Post;
