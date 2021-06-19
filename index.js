require('dotenv').config()
const { ApolloServer } = require("apollo-server");
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI
const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolvers')


mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true, useCreateIndex: true})
    .then(() => {
        console.log(`connected to MONGODB`)
    }).catch((error) => {
        console.log(`error connecting to MONGODB: ${error.message}`);
    });


const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.listen().then(({ url }) => {
    console.log(`server running on ${url}`)
})

