import { Context } from "../server";
import getUserId from "../utils/getUserId";
import { mustAuth } from "../utils/mustAuth";

interface PaginationArgs {}

// usersQueryArgs contains args for users query
interface usersQueryArgs {
  query: string;
  take: number;
  skip: number;
}

// postsQueryArgs contains args for posts query
interface postsQueryArgs {
  query: string;
  take: number;
  skip: number;
}

interface postArgs {
  id: string;
}

const Query = {
  async users(
    _: any,
    { query, skip, take }: usersQueryArgs,
    { prisma }: Context
  ) {
    if (!take) take = 5;
    if (!skip) skip = 0;

    if (!query) {
      return await prisma.user.findMany({
        take,
        skip,
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    const users = await prisma.user.findMany({
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
  },
  async post(_: any, { id }: postArgs, { prisma, authToken }: Context) {
    const userAuth = getUserId(authToken);

    // find post where published is true OR post belong to author
    const post = await prisma.post.findFirst({
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
  },
  async posts(
    _: any,
    { query, take, skip }: postsQueryArgs,
    { prisma }: Context
  ) {
    if (!take) take = 5;
    if (!skip) skip = 0;

    if (!query) {
      const posts = await prisma.post.findMany({
        where: {
          published: true,
        },
        take,
        skip,
      });
      return posts;
    }

    const posts = await prisma.post.findMany({
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
  },
  async myPosts(
    _: any,
    { query, take, skip }: postsQueryArgs,
    { prisma, authToken }: Context
  ) {
    const userAuth = getUserId(authToken);
    if (!userAuth.userAuthenticated) {
      throw new Error("Authentication Required");
    }

    if (!take) take = 5;
    if (!skip) skip = 0;

    if (!query) {
      return await prisma.post.findMany({
        where: {
          userId: userAuth.userId,
        },
        take,
        skip,
      });
    }

    return await prisma.post.findMany({
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
  },
  async comments(_: any, __: any, { prisma }: Context) {
    const comments = await prisma.comment.findMany();
    return comments;
  },
  async me(_: any, __: any, { prisma, authToken }: Context) {
    const userAuth = mustAuth(authToken);
    if (!userAuth.userAuthenticated) {
      throw new Error(userAuth.error);
    }
    const user = await prisma.user.findFirst({
      where: {
        id: userAuth.userId,
      },
    });

    console.log("user =", user);

    return user;
  },
};

export { Query };
