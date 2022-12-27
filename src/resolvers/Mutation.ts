import { Context } from "..";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import getUserId from "../utils/getUserId";
import { mustAuth } from "../utils/mustAuth";
import { generateToken } from "../utils/genetateToken";
import { hashPassword } from "../utils/hashPassword";

interface userCreateInput {
  input: {
    name: string;
    email: string;
    password: string;
  };
}

interface userUpdateInput {
  input: {
    name?: string;
    email?: string;
    password?: string;
  };
}

interface postCreateInput {
  input: {
    title: string;
    body: string;
    published: boolean;
  };
}

interface postDeleteArgs {
  id: string;
}

interface postUpdateInput {
  id: string;
  input: {
    title?: string;
    body?: string;
    published?: boolean;
  };
}

interface commentCreateInput {
  input: {
    text: string;
    post: string;
  };
}

interface commentDeleteArgs {
  id: string;
}

interface commentUpdateInput {
  id: string;
  input: {
    text?: string;
  };
}

interface userLoginInput {
  email: string;
  password: string;
}

const Mutation = {
  async userLogin(
    _: any,
    { email, password }: userLoginInput,
    { prisma }: Context
  ) {
    // find the user by its email
    const user = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!user) {
      throw new Error("no user with this email");
    }

    // compare user password with the hashed one
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("password is incorrect");
    }

    return {
      user,
      token: generateToken(user.id),
    };
  },
  async userCreate(_: any, { input }: userCreateInput, { prisma }: Context) {
    if (!input.name.trim()) {
      throw new Error("name should not be empty");
    }
    if (!input.email.trim()) {
      throw new Error("email should not be empty");
    }
    input.email = input.email.trim().toLowerCase();

    // check if the email is taken or not
    const numberOfUsersWithThisEmail = await prisma.user.count({
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
    input.password = await hashPassword(input.password);

    // create new user
    const user = await prisma.user.create({
      data: {
        ...input,
      },
    });

    return {
      user,
      token: generateToken(user.id),
    };
  },
  async userDelete(_: any, __: any, { prisma, authToken }: Context) {
    const { userId } = mustAuth(authToken);

    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return deletedUser;
  },
  async userUpdate(
    _: any,
    { input }: userUpdateInput,
    { prisma, authToken }: Context
  ) {
    // get the user id
    const { userId } = mustAuth(authToken);

    // validate updates
    const updates: {
      name?: string | undefined;
      email?: string | undefined;
      password?: string | undefined;
    } = {};

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
      updates.password = await hashPassword(input.password);
    }

    if (typeof input.email === "string") {
      input.email = input.email.trim();
      if (!input.email) {
        throw new Error("email can not be empty string");
      }

      // check if there is a user with the same email
      const userWithSameEmail = await prisma.user.findFirst({
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
    const userToUpdate = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!userToUpdate) {
      throw new Error(`can not find user with this id = ${userId}`);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...updates,
      },
    });

    // return updated user
    return updatedUser;
  },
  async postCreate(
    _: any,
    { input }: postCreateInput,
    { prisma, pubsub, authToken }: Context
  ) {
    // get userId
    const { userId } = mustAuth(authToken);

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
    const newPost = await prisma.post.create({
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
  },
  async postDelete(
    _: any,
    { id }: postDeleteArgs,
    { prisma, pubsub, authToken }: Context
  ) {
    // get user id from token
    const { userId } = mustAuth(authToken);

    // find post by id
    const numberOfExistedPosts = await prisma.post.count({
      where: {
        id: id,
        userId,
      },
    });
    if (numberOfExistedPosts === 0) {
      throw new Error(`No post found with id = ${id}`);
    }

    // deleted post
    const deletedPost = await prisma.post.delete({
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
  },
  async postUpdate(
    _: any,
    { id, input }: postUpdateInput,
    { prisma, pubsub, authToken }: Context
  ) {
    // get the userId for auth
    const { userId } = mustAuth(authToken);

    // get a copy of original post before update
    // by id and userId
    const originalPost = await prisma.post.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!originalPost) {
      throw new Error(`unable to update post with id = ${id}`);
    }

    // validate updates
    const updates: {
      title?: string | undefined;
      body?: string | undefined;
      published?: boolean | undefined;
    } = {};

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
    const updatedPost = await prisma.post.update({
      where: {
        id,
      },
      data: {
        ...input,
      },
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
    } else if (originalPost.published && !updatedPost.published) {
      // delete all post comments
      await prisma.comment.deleteMany({
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
    } else if (originalPost.published && updatedPost.published) {
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
  },
  async commentCreate(
    _: any,
    { input }: commentCreateInput,
    { prisma, pubsub, authToken }: Context
  ) {
    // get user id
    const { userId } = mustAuth(authToken);

    // check if post existed and published
    const numberOfPosts = await prisma.post.count({
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
    const newComment = await prisma.comment.create({
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
  },
  async commentDelete(
    _: any,
    { id }: commentDeleteArgs,
    { prisma, pubsub, authToken }: Context
  ) {
    // find userId
    const { userId } = mustAuth(authToken);

    // find comment -- owned by authenticated user
    const comment = await prisma.comment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!comment) {
      throw new Error(`Unable to delete comment with id = ${id}`);
    }

    const deletedComment = await prisma.comment.delete({
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
  },
  async commentUpdate(
    _: any,
    { id, input }: commentUpdateInput,
    { prisma, pubsub, authToken }: Context
  ) {
    // get userId
    const { userId } = mustAuth(authToken);

    // find the comment
    const comment = await prisma.comment.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!comment) {
      throw new Error(`unable to update comment with = ${id}`);
    }

    // validate input
    const updates: {
      text?: string | undefined;
    } = {};
    if (typeof input.text === "string") {
      input.text = input.text.trim();
      if (!input.text) {
        throw new Error(`comment text can not be empty string`);
      }
      updates.text = input.text;
    }

    // update comment
    const updatedComment = await prisma.comment.update({
      where: {
        id,
      },
      data: {
        ...updates,
      },
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
  },
};

export { Mutation };
