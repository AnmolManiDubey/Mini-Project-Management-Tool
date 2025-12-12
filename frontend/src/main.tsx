// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apollo Client v4 imports - ALL from the root package for React components/hooks
// ApolloClient, InMemoryCache, ApolloProvider, etc., all come from the root.
import { ApolloProvider } from "@apollo/client";
// You don't need to import ApolloClient, InMemoryCache, or HttpLink here
// unless you are using them directly to initialize the client in this file.

import { apolloClient } from "./lib/apolloClient";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* ApolloProvider must be imported from the root package */}
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);