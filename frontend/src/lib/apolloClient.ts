import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL || "http://localhost:8000/graphql/";

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  headers: {
    "X-ORG-SLUG": "Kav",
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
