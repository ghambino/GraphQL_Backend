require('dotenv').config()
const { ApolloServer } = require("apollo-server");
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI
const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolvers')
const User = require('./Models/user')
const jwt = require('jsonwebtoken');


mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true, useCreateIndex: true})
    .then(() => {
        console.log(`connected to MONGODB`)
    }).catch((error) => {
        console.log(`error connecting to MONGODB: ${error.message}`);
    });


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.toLowerCase().startsWith('bearer')){
            const decodedToken = jwt.verify(auth.substring(7), process.env.SECRET);

            const currentUser = await User.findById(decodedToken.id);

            return {
                currentUser
            }
        }
    }
});

server.listen().then(({ url }) => {
    console.log(`server running on ${url}`)
})

