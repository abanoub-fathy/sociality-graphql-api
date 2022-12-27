import { Comment } from '@prisma/client';
import { Context } from '..';

const Comment = {
  async author(parent: Comment, _: any, { prisma }: Context) {
    // return comment author
    return await prisma.user.findFirst({
      where: {
        id: parent.userId,
      },
    });
  },
  async post(parent: Comment, _: any, { prisma }: Context) {
    // return comment post
    return await prisma.post.findFirst({
      where: {
        id: parent.postId,
      },
    });
  },
};

export { Comment };
