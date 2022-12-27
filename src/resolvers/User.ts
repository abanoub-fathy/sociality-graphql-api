import { User } from "@prisma/client";
import { Context } from "..";
import getUserId from "../utils/getUserId";

const User = {
  async email(parent: User, __: any, { authToken }: Context) {
    const userAuth = getUserId(authToken);

    if (userAuth.userAuthenticated && parent.id === userAuth.userId) {
      return parent.email;
    } else {
      return null;
    }
  },
  async posts(parent: User, __: any, { prisma }: Context) {
    // return user published posts
    return await prisma.post.findMany({
      where: {
        userId: parent.id,
        published: true,
      },
    });
  },
  async comments(parent: User, __: any, { prisma }: Context) {
    // return user comments
    return await prisma.comment.findMany({
      where: {
        userId: parent.id,
      },
    });
  },
};

export { User };
