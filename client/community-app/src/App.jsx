import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import CommunityPage from "./pages/CommunityPage";
import SingleDiscussion from "./pages/SingleDiscussion";

import CommunityChatbot from "./components/CommunityChatBot";
import BusinessPage from "./pages/BusinessPage";
// Set up Apollo Client
const client = new ApolloClient({
  uri: "http://localhost:4002/graphql",
  cache: new InMemoryCache(),
  credentials: "include",
});

function App({ role, userId }) {
  const rolePassed = role || "business_owner"
  const userIdPassed = userId || "67f9c22d0ddbe30935c811b7"
//67f9c22d0ddbe30935c811b7
//business_owner

//67f9c52018b7f377b24e858f
//resident
  console.log("Community app", { userId, role }, { userIdType: typeof userId, roleType: typeof role });

  return (
    <ApolloProvider client={client}>

      <Router>
      <CommunityChatbot userId={userIdPassed}/>
        <Routes>
          <Route
            path="/"
            element={<CommunityPage role={rolePassed} userId={userIdPassed} />}
          />
          <Route path="/discussion/:id" element={<SingleDiscussion/>}/>
          <Route path="/business/:id" element= {<BusinessPage/>}/>
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;