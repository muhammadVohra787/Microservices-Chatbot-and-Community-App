import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import CommunityPage from "./pages/CommunityPage";
import SingleDiscussion from "./pages/SingleDiscussion";

import CommunityChatbot from "./components/CommunityChatBot";
// Set up Apollo Client
const client = new ApolloClient({
  uri: "http://localhost:4002/graphql",
  cache: new InMemoryCache(),
  credentials: "include",
});

function App({ role, userId }) {
  const rolePassed = role || "community_organizer";
  const userIdPassed = userId || "67d74fe58753092f5dcfbbe5";

  console.log("Community app", { userId, role }, { userIdType: typeof userId, roleType: typeof role });

  return (
    <ApolloProvider client={client}>

      <Router>
      <CommunityChatbot userId={userIdPassed}/>
        <Routes>
          {/* Home Page */}
          <Route
            path="/"
            element={<CommunityPage role={rolePassed} userId={userIdPassed} />}
          />
          <Route path="/discussion/:id" element={<SingleDiscussion/>}/>
          {/* 404 Page Not Found */}
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

// function App(){
//   return <h1>Hello</h1>
// }
export default App;