import fetch from "cross-fetch";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";

const getClient = (token: string | undefined = undefined) => {
  const url = "http://localhost:1233/graphql";
  const client = new ApolloClient({
    link: new HttpLink({
      uri: url,
      fetch,
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    }),
    cache: new InMemoryCache(),
  });
  return client;
};

export { getClient as default };
