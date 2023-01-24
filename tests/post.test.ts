import { gql } from "apollo-server";
import getClient from "./utils/client";
import seedDatabase, { postOne, userOne } from "./utils/seedDatabase";
import prisma from "./utils/prisma";
import postOperations from "./postOperations";

const client = getClient();

beforeEach(seedDatabase);

test("should fetch only published posts", async () => {
  const response = await client.query({ query: postOperations.getPostsQuery });

  expect(response.data.posts.length).toBe(1);
  expect(response.data.posts[0].published).toBe(true);
});

test("should fetch my posts including draft", async () => {
  const client = getClient(userOne.token);

  const { data } = await client.query({
    query: postOperations.getMyPostsQuery,
  });

  expect(data.myPosts.length).toBe(2);
});

test("should update user's post", async () => {
  const client = getClient(userOne.token);

  const { data } = await client.mutate({
    mutation: postOperations.updatePostMutation,
    variables: {
      postUpdateId: postOne.post?.id,
      postUpdateInput: {
        published: false,
      },
    },
  });

  expect(data.postUpdate.published).toBe(false);

  // get the post from db
  const postResponse = await prisma.post.findFirst({
    where: {
      id: postOne.post?.id,
      published: false,
    },
  });

  expect(postResponse?.id).toBe(postOne.post?.id);
});

test("Should delete user's post", async () => {
  const client = getClient(userOne.token);

  const { data } = await client.mutate({
    mutation: postOperations.deletePostMutation,
    variables: {
      postDeleteId: postOne.post?.id,
    },
  });

  expect(data.postDelete.id).toBe(postOne.post?.id);

  // make sure that the post not existed in DB
  const post = await prisma.post.findFirst({
    where: {
      id: postOne.post?.id,
    },
  });

  expect(post).toBeNull();
});

test("should create user's post", async () => {
  const client = getClient(userOne.token);

  const postTitle = "hello";
  const postBody = "this is my second post";
  const postpublished = true;

  const { data } = await client.mutate({
    mutation: postOperations.postCreateMutation,
    variables: {
      postCreateInput: {
        title: postTitle,
        body: postBody,
        published: postpublished,
      },
    },
  });

  expect(data.postCreate.title).toBe(postTitle);
  expect(data.postCreate.body).toBe(postBody);
  expect(data.postCreate.published).toBe(postpublished);
  expect(data.postCreate.author.id).toBe(userOne.user?.id);
});
