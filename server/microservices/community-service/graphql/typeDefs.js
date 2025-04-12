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

type Review {
  id: ID!
  business: BusinessProfile!
  user: User! @external
  rating: Float!
  comment: String
  createdAt: String!
  ownerReply: String
  sentiment: String
}

type Product {
  id: ID!
  business: BusinessProfile!
  name: String!
  price: Float!
  description: String
  image: String
  specialOffer: Boolean!
  createdAt: String!
}

type BusinessProfile {
  _id: ID!
  author: User! @external
  name: String!
  description: String
  address: String!
  image: String
  reviews: [Review]
  products: [Product]
}

# Queries
type Query {
  getCommunityPosts: [CommunityPost!]!
  getHelpRequests: [HelpRequest!]!
  communityAIQuery(input: String!, userId: ID!): AIResponse!
  getDiscussionById(postId: ID!) : CommunityPost
  getBusinsessByUserId(userId: ID!) : [BusinessProfile]
  getBusinessById(id: ID!) : BusinessProfile
  getAllBusinesses  : [BusinessProfile]
}

# Mutations
type Mutation {
  createCommunityPost(
    author: ID!,
    title: String!,
    content: String!,
    category: String!
  ): CommunityPost!

  createBusinessProfile(
    userId: ID!
    name: String!
    description: String
    address: String!
    image: String
  ): Boolean 


  createReview(
    businessId: ID!,
    userId: ID!,
    rating: Float!,
    comment: String
  ): Boolean

  createProduct(
    businessId: ID!,
    name: String!,
    price: Float!,
    description: String,
    image: String,
    specialOffer: Boolean
  ): Boolean
  
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
  replyReview(id: ID!, reply: String!): Boolean
  logout: Boolean
}
`

export default typeDefs;
