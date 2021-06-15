const { ApolloServer, gql, UserInputError } = require("apollo-server");
const { v1: uuid } = require("uuid");

let authors = [
    {
        name: 'Robert Martin',
        bookCount: 2,
        id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
        born: 1952
    },
    {
        name: 'Martin Fowler',
        bookCount: 1,
        id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
        born: 1963
    },
    {
        name: 'Fyodor Dostoevsky',
        bookCount: 2,
        id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
        born: 1821
    },
    {
        name: 'Joshua Kerievsky',
        bookCount: 1, // birthyear not known
        id: "afa5b6f2-344d-11e9-a414-719c6709cf3e"
    },
    {
        name: 'Sandi Metz', // birthyear not known
        id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
        bookCount: 1
    }
]

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

let books = [
    {
        title: 'Clean Code',
        published: 2008,
        author: 'Robert Martin',
        id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Agile software development',
        published: 2002,
        author: 'Robert Martin',
        id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
        genres: ['agile', 'patterns', 'design']
    },
    {
        title: 'Refactoring, edition 2',
        published: 2018,
        author: 'Martin Fowler',
        id: "afa5de00-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Refactoring to patterns',
        published: 2008,
        author: 'Joshua Kerievsky',
        id: "afa5de01-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'patterns']
    },
    {
        title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
        published: 2012,
        author: 'Sandi Metz',
        id: "afa5de02-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'design']
    },
    {
        title: 'Crime and punishment',
        published: 1866,
        author: 'Fyodor Dostoevsky',
        id: "afa5de03-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'crime']
    },
    {
        title: 'The Demon ',
        published: 1872,
        author: 'Fyodor Dostoevsky',
        id: "afa5de04-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'revolution']
    },
]

const typeDefs = gql`
    type Book {
      title: String!
      published: Int!
      author: String!
      id: ID!
      genres: [String!]!
  }
  type Author {
      name: String!
      id: ID!
      born: Int
      bookCount: Int!
  }
  type Query {
      bookCount: Int!
       authorCount: Int!
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
  }
  `
const resolvers = {
    Query: {
        bookCount: () => books.length,
        authorCount: () => authors.length,
        allBooks: (root, arg) => {
            if (!arg.author && !arg.genre) {
                return books
            }
            else if (arg.author) {
                const expectedBook = books.filter((book) => book.author === arg.author)
                return expectedBook
            }
            else if (arg.genre) {
                const expectedBook = books.filter((book) => book.genres.includes(arg.genre))
                return expectedBook
            }

        },
        allAuthors: () => authors
    },
    Mutation: {

        addBook: (root, args) => {
            if (books.find(unit => unit.title === args.title)) {
                throw new UserInputError("title must be unique", {
                    invalidArg: args.title
                })
            }
            const newBook = { ...args, id: uuid() }
            books = books.concat(newBook);

            // const { author } = args;
            if (authors.find(author => author.name !== args.author)) {
                const newAuthor = {
                    name: author,
                    born: null,
                    bookCount: 1
                }
                authors = authors.concat(newAuthor)
            }

            return newBook
        },

        editAuthor: (root, args) => {
            // if(!args.name) return null;
            let author = authors.find(auth => auth.name === args.name)

            if (!author) {
                throw new UserInputError("Author not found", {
                    invalidArg: args.name
                })
            }

            let editedAuthor = { ...author, born: args.setBornTo };

            authors.map(aut => aut.name === args.name ? editedAuthor : aut)

            return editedAuthor
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.listen().then(({ url }) => {
    console.log(`server running on ${url}`)
})

