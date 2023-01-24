import { gql } from "@apollo/client/core";

gql;
const createUserMutation = gql`
  mutation userCreate($userCreateInput: userCreateInput!) {
    userCreate(input: $userCreateInput) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const getUsersQuery = gql`
  query users {
    users {
      id
      name
      email
    }
  }
`;

const loginMutation = gql`
  mutation login($userLoginEmail: String!, $userLoginPassword: String!) {
    userLogin(email: $userLoginEmail, password: $userLoginPassword) {
      token
      user {
        id
        name
      }
    }
  }
`;

const getUserProfileQuery = gql`
  query me {
    me {
      id
      name
      email
    }
  }
`;

const userOpertaions = {
  createUserMutation,
  getUsersQuery,
  loginMutation,
  getUserProfileQuery,
};

export { userOpertaions as default };
