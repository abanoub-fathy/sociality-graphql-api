import { gql } from "@apollo/client/core";

const getPostsQuery = gql`
  query posts {
    posts {
      id
      title
      body
      published
    }
  }
`;

const getMyPostsQuery = gql`
  query myPosts {
    myPosts {
      title
      body
      published
    }
  }
`;

const updatePostMutation = gql`
  mutation postUpdate($postUpdateId: ID!, $postUpdateInput: postUpdateInput!) {
    postUpdate(id: $postUpdateId, input: $postUpdateInput) {
      id
      title
      body
      published
    }
  }
`;

const deletePostMutation = gql`
  mutation postDelete($postDeleteId: ID!) {
    postDelete(id: $postDeleteId) {
      id
      title
      body
      published
    }
  }
`;

const postCreateMutation = gql`
  mutation postCreate($postCreateInput: postCreateInput!) {
    postCreate(input: $postCreateInput) {
      id
      title
      body
      published
      author {
        id
      }
    }
  }
`;

const postOpertaions = {
  getPostsQuery,
  getMyPostsQuery,
  postCreateMutation,
  updatePostMutation,
  deletePostMutation,
};

export { postOpertaions as default };
