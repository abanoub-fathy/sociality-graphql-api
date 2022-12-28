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
exports.User = void 0;
const getUserId_1 = __importDefault(require("../utils/getUserId"));
const User = {
    email(parent, __, { authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAuth = (0, getUserId_1.default)(authToken);
            if (userAuth.userAuthenticated && parent.id === userAuth.userId) {
                return parent.email;
            }
            else {
                return null;
            }
        });
    },
    posts(parent, __, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            // return user published posts
            return yield prisma.post.findMany({
                where: {
                    userId: parent.id,
                    published: true,
                },
            });
        });
    },
    comments(parent, __, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            // return user comments
            return yield prisma.comment.findMany({
                where: {
                    userId: parent.id,
                },
            });
        });
    },
};
exports.User = User;
