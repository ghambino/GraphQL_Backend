const { gql } = require('apollo-server');

 const typeDefs = gql`
    type Book {
      title: String!
      published: Int!
      author: Author!
      genres: [String!]!
      id: ID!
  }
  type Author {
      name: String!
      born: Int
      bookCount: Int!
      id: ID!
  }
  type User {
    username: String!
    name: String!
    password: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Query {
       bookCount: Int!
       authorCount: Int!
       me: User
       allBooks(author: String genre: String): [Book]!
       allAuthors: [Author!]!
  }
  type Mutation {
   addBook (
     title: String!
     author: String!
     published: Int!
     genres: [String!]
   ): Book
   editAuthor(name: String! setBornTo: Int!): Author!
   createUser (
     username: String! 
     name: String! 
     password: String! 
     favoriteGenre: String!
     ): User
    login(
      username: String!
      password: String!
    ): Token
  }
  `

module.exports = {
    typeDefs
}