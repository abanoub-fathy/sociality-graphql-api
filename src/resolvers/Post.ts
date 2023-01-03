import { Post } from "@prisma/client";
import { Context } from "../server";

const Post = {
  async author(parent: Post, _: any, { prisma, pubsub }: Context) {
    // return post author
    return await prisma.user.findUnique({
      where: {
        id: parent.userId,
      },
    });
  },
  async comments(parent: Post, _: any, { prisma, pubsub }: Context) {
    // return post comments
    return await prisma.comment.findMany({
      where: {
        postId: parent.id,
      },
    });
  },
};

export { Post };
