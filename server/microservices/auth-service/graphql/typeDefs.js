//typeDefs from Auth-service

const typeDefs = `#graphql
    type User @key(fields: "id") {
        id: ID!
        username: String!
        email: String!
        role: String!
    }

    type UserWithID{
        id: ID!
        username: String!
        email: String!
        role: String!
    }
    type Query {
        currentUser: UserWithID
        getUserById(id: ID!): User
    }
    type Mutation {
        login(username: String!, password: String!): User
        register(username: String!, email: String!, password: String!, role: String!): Boolean
    }
`;

export default typeDefs;
