require('dotenv').config()
const { UserInputError, PubSub, AuthenticationError } = require("apollo-server");
const { v1: uuid } = require("uuid");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { authors, books } = require('./resources')
const Book = require('./Models/book')
const Author = require('./Models/author')
const User = require('./Models/user')
// const pubsub = new PubSub();

console.log(process.env.SECRET)
const resolvers = {
    Query: {
        bookCount: () => Book.find({}).countDocuments(),
        authorCount: () => Author.find({}).countDocuments(),
        allBooks: async (root, arg) => {
            if (!arg.author && !arg.genre) {
                return await Book.find({})
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
        me: (root, args, context) => {
            const { currentUser } = context;

            return currentUser
        },
        allAuthors: async () => await Author.find({})
    },
    Mutation: {

        addBook: async (root, args, { currentUser}) => {
            if (!currentUser){
                throw new AuthenticationError('not authenticated, make sure youre logged in')
            }
            const {title, author, published, genres } = args;

            try {
                const newBook = new Book({
                    title,
                    published: parseInt(published),
                    genres
                });

                let authorId = await Author.findOne({name: author}).select('_id');

                if (!authorId){
                    const newAuthor = new Author({name: author, born: null});
                    await newAuthor.save();
                    authorId = newAuthor._id
                }
                newBook.author = authorId;
                await newBook.save();

                const bookAdded = await Book.findOne({title}).populate('author') 
                // await pubsub.publish('BOOK_ADDED', {
                //     bookAdded
                // })
                return bookAdded;

            } catch(error) {
                throw new UserInputError(error.message)
            }



            // if (books.find(unit => unit.title === args.title)) {
            //     throw new UserInputError("title must be unique", {
            //         invalidArg: args.title
            //     })
            // }
            // const newBook = { ...args, id: uuid() }
            // books = books.concat(newBook);

            // // const { author } = args;
            // if (authors.find(author => author.name !== args.author)) {
            //     const newAuthor = {
            //         name: args.author,
            //         born: null,
            //         bookCount: 1,
            //         id: uuid()
            //     }
            //     authors = authors.concat(newAuthor)
            // }

            // return newBook
        },

        editAuthor: async (root, args, {currentUser}) => {
            if (!currentUser){
                throw new AuthenticationError('not authenticated, make sure youre logged in')
            }
        const { name, setBornTo } = args;
            let author = await Author.findOne({name: name});
            author.born = setBornTo
            
            try{
                await author.save()
            }catch(error) {
                throw new UserInputError(error.message)
            }

            return author

            // let author = authors.find(auth => auth.name.toLowerCase() === args.name.toLowerCase())

            // let editedAuthor = { ...author, born: args.setBornTo };

            // if (!author) {
            //     throw new UserInputError("Author not found", {
            //         invalidArg: args.name
            //     })
            // }else if (author) {

            //     authors = authors.map(aut => aut.name === args.name ? editedAuthor : aut);


            // }

          

            

            // return editedAuthor
        },
        createUser: async(root, args) => {
            const { username, name, password, favoriteGenre } = args
            const saltRound = 10;
            const passwordHash = await bcrypt.hash(password, saltRound);
            try{
                let newUser = new User({
                    username,
                    name,
                    password: passwordHash,
                    favoriteGenre
                })
                const user = await newUser.save()
                return user
            }catch(error){
                throw new UserInputError(error.message)
            }

        },
        login: async (root, args) => {
            const { username, password } = args;

            let user = await User.findOne({ username });
            // console.log(user)
            const correctPassword = user !== null ?  await bcrypt.compare(password, user.password) : false;

            if (!user || !correctPassword){
                throw new UserInputError('invalid login Credentials', {
                    invalidArgs: args.username
                })
            }
             const userForToken = {
                 username: user.username,
                 id: user._id
             }

             const Token = jwt.sign(userForToken, process.env.SECRET)

             return {
                 value: Token
             }

        }
    }
}

module.exports = {
    resolvers
}