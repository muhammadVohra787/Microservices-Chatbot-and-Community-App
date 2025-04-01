//typeDefs from Community

const typeDefs = `#graphql
  #graphql
  type User @key(fields: "id") {
    id: ID! @external
    username: String! @external
    email: String! @external
    role: String! @external
  }



type CommunityPost {
  id: ID!
  author: User! @external
  title: String!
  content: String!
  category: String!
  aiSummary: String
  createdAt: String!
}

type HelpRequest {
  id: ID!
  author: User! @external
  description: String!
  location: String
  isResolved: Boolean!
  volunteers: [User!]! @external
  createdAt: String!
}
type AIResponse {
    text: String!
    suggestedQuestions: [String]!
    retrievedPosts: [CommunityPost]!
  }

# Queries
type Query {
  getCommunityPosts: [CommunityPost!]!
  getHelpRequests: [HelpRequest!]!
  communityAIQuery(input: String!, userId: ID!): AIResponse!
  getDiscussionById(postId: ID!) : CommunityPost
}

# Mutations
type Mutation {
  createCommunityPost(
    author: ID!,
    title: String!,
    content: String!,
    category: String!
  ): CommunityPost!

  createHelpRequest(
    author: ID!,
    description: String!,
    aiSummary:String,
    location: String
  ): Boolean

  markHelpRequestResolved(id: ID!): Boolean
  
  addVolunteerToHelpRequest(id: ID!, volunteerId: ID!): Boolean

  # New Mutations:
  updateCommunityPost(
    id: ID!,
    title: String,
    content: String,
    aiSummary: String,
    category: String
  ): CommunityPost!

  deleteCommunityPost(id: ID!): Boolean

  updateHelpRequest(
    id: ID!,
    description: String,
    location: String,
    isResolved: Boolean
  ): HelpRequest!

  deleteHelpRequest(id: ID!): Boolean

  logout: Boolean
}
`

export default typeDefs;
