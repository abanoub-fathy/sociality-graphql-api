import fetch from "cross-fetch";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { split, HttpLink } from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import WebSocket from "ws";

const getWsLink = (token: string | undefined) => {
  const wsLink = new GraphQLWsLink(
    createClient({
      url: `ws://localhost:${process.env.PORT as string}/graphql`,
      connectionParams: {
        authToken: token as string,
      },
      webSocketImpl: WebSocket,
    })
  );

  return wsLink;
};

const getHttpLink = (token: string | undefined) => {
  const httpLink = new HttpLink({
    uri: `http://localhost:${process.env.PORT as string}/graphql`,
    fetch,
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });
  return httpLink;
};

const useSplit = (token: string | undefined) => {
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    getWsLink(token),
    getHttpLink(token)
  );

  return splitLink;
};

const getClient = (token: string | undefined = undefined) => {
  const client = new ApolloClient({
    link: useSplit(token),
    cache: new InMemoryCache(),
  });
  return client;
};

export { getClient as default };
