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
      url: "ws://localhost:1233/graphql",
      connectionParams: {
        authToken: `Bearer ${token}`,
      },
      webSocketImpl: WebSocket,
      on: {
        connecting: () => {
          console.log("connecting");
        },
        connected: (data) => {
          console.log("connected, data =");
        },
        ping: () => {
          console.log("ping");
        },
        pong: () => {
          console.log("pong");
        },
        closed: () => {
          console.log("closed");
        },
      },
    })
  );

  return wsLink;
};

const getHttpLink = (token: string | undefined) => {
  const httpLink = new HttpLink({
    uri: "http://localhost:1233/graphql",
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
