import { gql } from "@apollo/client/core";

const deleteCommentMutation = gql`
  mutation commentDelete($commentDeleteId: ID!) {
    commentDelete(id: $commentDeleteId) {
      id
      text
    }
  }
`;

const commentOperations = {
  deleteCommentMutation,
};

export { commentOperations as default };
