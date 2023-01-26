import { gql } from "@apollo/client/core";

const deleteCommentMutation = gql`
  mutation commentDelete($commentDeleteId: ID!) {
    commentDelete(id: $commentDeleteId) {
      id
      text
    }
  }
`;

const postCommentSubscription = gql`
  subscription ($postId: String!) {
    comment(postId: $postId) {
      data {
        id
        text
      }
      mutation
    }
  }
`;

const commentOperations = {
  deleteCommentMutation,
  postCommentSubscription,
};

export { commentOperations as default };
