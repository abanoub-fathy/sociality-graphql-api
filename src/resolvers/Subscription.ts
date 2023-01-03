import { Context } from "../server";
import { mustAuth } from "../utils/mustAuth";

interface PostSubscribeArgs {
  postId: string;
}

const Subscription = {
  comment: {
    async subscribe(
      _: any,
      { postId }: PostSubscribeArgs,
      { prisma, pubsub }: Context
    ) {
      // find the post id we want to subscribe to
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
        },
      });
      if (!post) {
        throw new Error(`post with id = ${postId} not found`);
      }
      return pubsub.asyncIterator(`commentOnPostWithID=${postId}`);
    },
  },
  post: {
    subscribe(_: any, __: any, { pubsub }: Context) {
      return pubsub.asyncIterator(`post`);
    },
  },
  myPost: {
    subscribe(_: any, __: any, { pubsub, prisma, authToken }: Context) {
      const userAuth = mustAuth(authToken);
      console.log(`postForUserID=${userAuth.userId}`);
      return pubsub.asyncIterator(`postForUserID=${userAuth.userId}`);
    },
  },
};

export { Subscription };
