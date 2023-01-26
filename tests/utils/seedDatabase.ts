import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { User, Post, Comment } from "@prisma/client";
import jwt from "jsonwebtoken";

interface testUser {
  input: {
    name: string;
    email: string;
    password: string;
  };
  user: User | undefined;
  token: string | undefined;
}

interface testPost {
  input: {
    title: string;
    body: string;
    published: boolean;
  };
  post: Post | undefined;
}

interface testComment {
  input: {
    text: string;
  };
  comment: Comment | undefined;
}

const userOne: testUser = {
  input: {
    name: "John Doe",
    email: "someone@example.com",
    password: bcrypt.hashSync("12345678ABC!", 10),
  },
  user: undefined,
  token: undefined,
};

const userTwo: testUser = {
  input: {
    name: "UserName Two",
    email: "somebody@example.com",
    password: bcrypt.hashSync("12345678ABC!", 10),
  },
  user: undefined,
  token: undefined,
};

const postOne: testPost = {
  input: {
    title: "post 1 title",
    body: "post 1 body",
    published: true,
  },
  post: undefined,
};

const postTwo: testPost = {
  input: {
    title: "post 2 title",
    body: "post 2 body",
    published: false,
  },
  post: undefined,
};

const commentOne: testComment = {
  input: {
    text: "this comment by userOne on postOne",
  },
  comment: undefined,
};

const commentTwo: testComment = {
  input: {
    text: "this comment by userTwo on posOne",
  },
  comment: undefined,
};

const seedDatabase = async () => {
  // delete testing data
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();

  // create userOne
  userOne.user = await prisma.user.create({ data: userOne.input });

  // assign token to userOne
  userOne.token = jwt.sign(
    { userId: userOne.user.id },
    process.env.JWT_SECRET as string
  );

  // create userTwo
  userTwo.user = await prisma.user.create({ data: userTwo.input });

  // assign token to userTwo
  userTwo.token = jwt.sign(
    { userId: userTwo.user.id },
    process.env.JWT_SECRET as string
  );

  // create user post one
  postOne.post = await prisma.post.create({
    data: {
      ...postOne.input,
      userId: userOne.user.id,
    },
  });

  // create user post two
  postTwo.post = await prisma.post.create({
    data: {
      ...postTwo.input,
      userId: userOne.user.id,
    },
  });

  // create commentOne
  commentOne.comment = await prisma.comment.create({
    data: {
      ...commentOne.input,
      userId: userOne.user.id,
      postId: postOne.post.id,
    },
  });

  // create commentTwo
  commentTwo.comment = await prisma.comment.create({
    data: {
      ...commentTwo.input,
      userId: userTwo.user.id,
      postId: postOne.post.id,
    },
  });
};

export {
  seedDatabase as default,
  userOne,
  userTwo,
  postOne,
  postTwo,
  commentOne,
  commentTwo,
};
