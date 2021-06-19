const { UserInputError } = require("apollo-server");
const { v1: uuid } = require("uuid");
const { authors, books } = require('./resources')
const Book = require('./Models/book')
const Author = require('./Models/author')


const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
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
                    name: args.author,
                    born: null,
                    bookCount: 1,
                    id: uuid()
                }
                authors = authors.concat(newAuthor)
            }

            return newBook
        },

        editAuthor: (root, args) => {

            let author = authors.find(auth => auth.name.toLowerCase() === args.name.toLowerCase())

            let editedAuthor = { ...author, born: args.setBornTo };

            if (!author) {
                throw new UserInputError("Author not found", {
                    invalidArg: args.name
                })
            }else if (author) {

                authors = authors.map(aut => aut.name === args.name ? editedAuthor : aut);


            }

          

            

            return editedAuthor
        }
    }
}

module.exports = {
    resolvers
}