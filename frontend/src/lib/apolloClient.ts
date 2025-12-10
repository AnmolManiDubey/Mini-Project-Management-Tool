import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "http://localhost:8000/graphql/",
  // For now, we hardcode org slug; later you can make it dynamic
  headers: {
    "X-ORG-SLUG": "Kav", // use your actual org slug here, it's case-sensitive
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
