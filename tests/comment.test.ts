import seedDatabase, {
  commentOne,
  commentTwo,
  userOne,
} from "./utils/seedDatabase";
import getClient from "./utils/client";
import commentOperations from "./utils/commentOperations";
import prisma from "./utils/prisma";

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
