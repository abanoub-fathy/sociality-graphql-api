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
exports.Mutation = void 0;
const bcryptjs_1 = require("bcryptjs");
const mustAuth_1 = require("../utils/mustAuth");
const genetateToken_1 = require("../utils/genetateToken");
const hashPassword_1 = require("../utils/hashPassword");
const Mutation = {
    userLogin(_, { email, password }, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            // find the user by its email
            const user = yield prisma.user.findFirst({
                where: {
                    email: email.trim().toLowerCase(),
                },
            });
            if (!user) {
                throw new Error("no user with this email");
            }
            // compare user password with the hashed one
            const passwordMatch = yield (0, bcryptjs_1.compare)(password, user.password);
            if (!passwordMatch) {
                throw new Error("password is incorrect");
            }
            return {
                user,
                token: (0, genetateToken_1.generateToken)(user.id),
            };
        });
    },
    userCreate(_, { input }, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!input.name.trim()) {
                throw new Error("name should not be empty");
            }
            if (!input.email.trim()) {
                throw new Error("email should not be empty");
            }
            input.email = input.email.trim().toLowerCase();
            // check if the email is taken or not
            const numberOfUsersWithThisEmail = yield prisma.user.count({
                where: {
                    email: input.email,
                },
            });
            if (numberOfUsersWithThisEmail > 0) {
                throw new Error(`the email ${input.email} is already taken`);
            }
            // validate password
            if (input.password.length < 8) {
                throw new Error("password can not be less than 8 chars");
            }
            // hash password
            input.password = yield (0, hashPassword_1.hashPassword)(input.password);
            // create new user
            const user = yield prisma.user.create({
                data: Object.assign({}, input),
            });
            return {
                user,
                token: (0, genetateToken_1.generateToken)(user.id),
            };
        });
    },
    userDelete(_, __, { prisma, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = (0, mustAuth_1.mustAuth)(authToken);
            const deletedUser = yield prisma.user.delete({
                where: {
                    id: userId,
                },
            });
            return deletedUser;
        });
    },
    userUpdate(_, { input }, { prisma, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            // get the user id
            const { userId } = (0, mustAuth_1.mustAuth)(authToken);
            // validate updates
            const updates = {};
            if (typeof input.name === "string") {
                updates.name = input.name.trim();
                if (!updates.name) {
                    throw new Error("name can not be empty string");
                }
            }
            if (typeof input.password == "string") {
                if (input.password.length < 8) {
                    throw new Error("password can not be less that 8 chars");
                }
                // hash password
                updates.password = yield (0, hashPassword_1.hashPassword)(input.password);
            }
            if (typeof input.email === "string") {
                input.email = input.email.trim();
                if (!input.email) {
                    throw new Error("email can not be empty string");
                }
                // check if there is a user with the same email
                const userWithSameEmail = yield prisma.user.findFirst({
                    where: {
                        email: input.email,
                    },
                });
                if (userWithSameEmail) {
                    throw new Error(`the email ${input.email} is already taken`);
                }
                updates.email = input.email;
            }
            // fetch user to update
            const userToUpdate = yield prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });
            if (!userToUpdate) {
                throw new Error(`can not find user with this id = ${userId}`);
            }
            const updatedUser = yield prisma.user.update({
                where: {
                    id: userId,
                },
                data: Object.assign({}, updates),
            });
            // return updated user
            return updatedUser;
        });
    },
    postCreate(_, { input }, { prisma, pubsub, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            // get userId
            const { userId } = (0, mustAuth_1.mustAuth)(authToken);
            // validate post input
            input.title = input.title.trim();
            if (!input.title) {
                throw new Error(`title can not be empty`);
            }
            input.body = input.body.trim();
            if (!input.body) {
                throw new Error(`body can not be empty`);
            }
            // create post
            const newPost = yield prisma.post.create({
                data: {
                    title: input.title,
                    body: input.title,
                    published: input.published,
                    userId: userId,
                },
            });
            // puplish to owner
            pubsub.publish(`postForUserID=${userId}`, {
                myPost: { data: newPost, mutation: "CREATED" },
            });
            // publish post
            if (newPost.published) {
                pubsub.publish(`post`, { post: { data: newPost, mutation: "CREATED" } });
            }
            // return post
            return newPost;
        });
    },
    postDelete(_, { id }, { prisma, pubsub, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            // get user id from token
            const { userId } = (0, mustAuth_1.mustAuth)(authToken);
            // find post by id
            const numberOfExistedPosts = yield prisma.post.count({
                where: {
                    id: id,
                    userId,
                },
            });
            if (numberOfExistedPosts === 0) {
                throw new Error(`No post found with id = ${id}`);
            }
            // deleted post
            const deletedPost = yield prisma.post.delete({
                where: {
                    id,
                },
            });
            // publish that post is deleted if it is public post
            if (deletedPost.published) {
                pubsub.publish(`post`, {
                    post: {
                        data: deletedPost,
                        mutation: "DELETED",
                    },
                });
            }
            pubsub.publish(`postForUserID=${userId}`, {
                myPost: {
                    data: deletedPost,
                    mutation: "DELETED",
                },
            });
            // return post
            return deletedPost;
        });
    },
    postUpdate(_, { id, input }, { prisma, pubsub, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            // get the userId for auth
            const { userId } = (0, mustAuth_1.mustAuth)(authToken);
            // get a copy of original post before update
            // by id and userId
            const originalPost = yield prisma.post.findFirst({
                where: {
                    id,
                    userId,
                },
            });
            if (!originalPost) {
                throw new Error(`unable to update post with id = ${id}`);
            }
            // validate updates
            const updates = {};
            if (typeof input.title === "string") {
                input.title = input.title.trim();
                if (!input.title) {
                    throw new Error(`post title can not be empty string`);
                }
                updates.title = input.title;
            }
            if (typeof input.body === "string") {
                input.body = input.body.trim();
                if (!input.body) {
                    throw new Error(`post body can not be empty string`);
                }
                updates.body = input.body;
            }
            if (typeof input.published === "boolean") {
                updates.published = input.published;
            }
            // updated post
            const updatedPost = yield prisma.post.update({
                where: {
                    id,
                },
                data: Object.assign({}, input),
            });
            // publish post to owner
            pubsub.publish(`postForUserID=${userId}`, {
                myPost: {
                    data: updatedPost,
                    mutation: "UPDATED",
                },
            });
            // publish the post
            if (!originalPost.published && updatedPost.published) {
                // if post was unpublished and then published => status created
                pubsub.publish("post", {
                    post: {
                        data: updatedPost,
                        mutation: "CREATED",
                    },
                });
            }
            else if (originalPost.published && !updatedPost.published) {
                // delete all post comments
                yield prisma.comment.deleteMany({
                    where: {
                        postId: updatedPost.id,
                    },
                });
                // if post was published and then unpublished => status deleted
                pubsub.publish("post", {
                    post: {
                        data: originalPost,
                        mutation: "DELETED",
                    },
                });
            }
            else if (originalPost.published && updatedPost.published) {
                // if post was published and then published => status updated
                pubsub.publish("post", {
                    post: {
                        data: updatedPost,
                        mutation: "UPDATED",
                    },
                });
            }
            // return updated post
            return updatedPost;
        });
    },
    commentCreate(_, { input }, { prisma, pubsub, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            // get user id
            const { userId } = (0, mustAuth_1.mustAuth)(authToken);
            // check if post existed and published
            const numberOfPosts = yield prisma.post.count({
                where: {
                    published: true,
                    id: input.post,
                },
            });
            if (!numberOfPosts) {
                throw new Error(`no post with this id = ${input.post}`);
            }
            // validate and normalize text
            input.text = input.text.trim();
            if (!input.text) {
                throw new Error(`text can not be empty`);
            }
            // create new comment
            const newComment = yield prisma.comment.create({
                data: {
                    text: input.text,
                    postId: input.post,
                    userId: userId,
                },
            });
            // publish comment
            pubsub.publish(`commentOnPostWithID=${input.post}`, {
                comment: {
                    data: newComment,
                    mutation: "CREATED",
                },
            });
            // return new comment
            return newComment;
        });
    },
    commentDelete(_, { id }, { prisma, pubsub, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            // find userId
            const { userId } = (0, mustAuth_1.mustAuth)(authToken);
            // find comment -- owned by authenticated user
            const comment = yield prisma.comment.findFirst({
                where: {
                    id,
                    userId,
                },
            });
            if (!comment) {
                throw new Error(`Unable to delete comment with id = ${id}`);
            }
            const deletedComment = yield prisma.comment.delete({
                where: {
                    id,
                },
            });
            // publish that the comment is deleted
            pubsub.publish(`commentOnPostWithID=${deletedComment.postId}`, {
                comment: {
                    data: deletedComment,
                    mutation: "DELETED",
                },
            });
            // return deleted comment
            return deletedComment;
        });
    },
    commentUpdate(_, { id, input }, { prisma, pubsub, authToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            // get userId
            const { userId } = (0, mustAuth_1.mustAuth)(authToken);
            // find the comment
            const comment = yield prisma.comment.findFirst({
                where: {
                    id,
                    userId,
                },
            });
            if (!comment) {
                throw new Error(`unable to update comment with = ${id}`);
            }
            // validate input
            const updates = {};
            if (typeof input.text === "string") {
                input.text = input.text.trim();
                if (!input.text) {
                    throw new Error(`comment text can not be empty string`);
                }
                updates.text = input.text;
            }
            // update comment
            const updatedComment = yield prisma.comment.update({
                where: {
                    id,
                },
                data: Object.assign({}, updates),
            });
            // publish comment is updated
            pubsub.publish(`commentOnPostWithID=${updatedComment.postId}`, {
                comment: {
                    data: updatedComment,
                    mutation: "UPDATED",
                },
            });
            // return updated comment
            return updatedComment;
        });
    },
};
exports.Mutation = Mutation;
