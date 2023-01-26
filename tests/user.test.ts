import userOperations from "./utils/userOperations";
import getClient from "./utils/client";
import prisma from "./utils/prisma";
import seedDatabase, { userOne } from "./utils/seedDatabase";

const client = getClient();

// beforeEach will run before each test case
beforeEach(seedDatabase);

test("should create a new user", async () => {
  const response = await client.mutate({
    mutation: userOperations.createUserMutation,
    variables: {
      userCreateInput: {
        email: "aop4ever@gmail.com",
        password: "12345678",
        name: "Abanoub",
      },
    },
  });

  const createdUserId = response.data.userCreate.user.id;

  // fetch user created
  const userFetched = await prisma.user.findFirstOrThrow({
    where: {
      id: createdUserId,
    },
  });

  // expect fetched user id to be the same as the created user id
  expect(userFetched.id).toBe(createdUserId);
});

test("should throw an error when signup with short password", async () => {
  const responsePromise = client.mutate({
    mutation: userOperations.createUserMutation,
    variables: {
      userCreateInput: {
        email: "someone2@example.com",
        password: "12345",
        name: "random",
      },
    },
  });

  await expect(responsePromise).rejects.toThrow();
});

test("should expose the public info in user profile", async () => {
  const response = await client.query({
    query: userOperations.getUsersQuery,
  });

  expect(response.data.users.length).not.toBe(0);
  expect(response.data.users[0].email).toBeNull();
});

test("should throw an error when log in with bad credentials", async () => {
  const responsePromise = client.mutate({
    mutation: userOperations.loginMutation,
    variables: {
      userLoginEmail: "someone@example.com",
      userLoginPassword: "notCorrectPassword!",
    },
  });

  await expect(responsePromise).rejects.toThrow();
});

test("should get user profile", async () => {
  // get auth client
  const client = getClient(userOne.token);

  const { data } = await client.query({
    query: userOperations.getUserProfileQuery,
  });

  expect(data.me.id).toBe(userOne.user?.id);
  expect(data.me.name).toBe(userOne.user?.name);
  expect(data.me.email).toBe(userOne.user?.email);
});
