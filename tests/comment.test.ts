import seedDatabase, {
  commentOne,
  commentTwo,
  postOne,
  userOne,
} from "./utils/seedDatabase";
import getClient from "./utils/client";
import commentOperations from "./utils/commentOperations";
import prisma from "./utils/prisma";
import fetch from "cross-fetch";

beforeEach(seedDatabase);
const client = getClient();

test("should  delete own comment", async () => {
  const client = getClient(userOne.token);

  const { data } = await client.mutate({
    mutation: commentOperations.deleteCommentMutation,
    variables: {
      commentDeleteId: commentOne.comment?.id,
    },
  });

  expect(data.commentDelete.id).toBe(commentOne.comment?.id);

  const commentFetched = await prisma.comment.findFirst({
    where: {
      id: commentOne.comment?.id,
    },
  });

  expect(commentFetched).toBeNull();
});

test("should not delete other user's comment", async () => {
  const client = getClient(userOne.token);

  const deletePromise = client.mutate({
    mutation: commentOperations.deleteCommentMutation,
    variables: {
      commentDeleteId: commentTwo.comment?.id,
    },
  });

  await expect(deletePromise).rejects.toThrow();

  const commentFetched = await prisma.comment.findFirstOrThrow({
    where: {
      id: commentTwo.comment?.id,
    },
  });

  expect(commentFetched.id).toBe(commentTwo.comment?.id);
});

test("should subscribe to post comments", (done) => {
  const subscriptionOnComments = client.subscribe({
    query: commentOperations.postCommentSubscription,
    variables: {
      postId: postOne.post?.id,
    },
    fetchPolicy: "no-cache",
  });

  subscriptionOnComments.subscribe({
    start(subscription) {
      console.log("subscription =", subscription);
    },
    next(value) {
      console.log("value =", value);
      done();
    },
    complete() {
      console.log("subscription completed");
    },
    error(errorValue) {
      console.log("errorValue =", errorValue);
    },
  });

  const deleteUserComment = async () => {
    const clientAuth = getClient(userOne.token);
    await clientAuth.mutate({
      mutation: commentOperations.deleteCommentMutation,
      variables: {
        commentDeleteId: commentOne.comment?.id,
      },
    });
  };

  deleteUserComment();
});
