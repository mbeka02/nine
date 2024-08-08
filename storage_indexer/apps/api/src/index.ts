import 'dotenv/config'
import { ApolloServer } from '@apollo/server';
import { GraphQLScalarType, Kind } from 'graphql';
import GraphQLJSON from "graphql-type-json";
import TypeDef from './typedef';
import { startStandaloneServer } from "@apollo/server/standalone"
import { nineQueries } from './resolvers/queries';

const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
        if (value instanceof Date) {
            return value.getTime(); // Convert outgoing Date to integer for JSON
        }
        throw Error('GraphQL Date Scalar serializer expected a `Date` object');
    },
    parseValue(value) {
        if (typeof value === 'number') {
            return new Date(value); // Convert incoming integer to Date
        }
        throw new Error('GraphQL Date Scalar parser expected a `number`');
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            // Convert hard-coded AST string to integer and then to Date
            return new Date(parseInt(ast.value, 10));
        }
        // Invalid hard-coded value (not an integer)
        return null;
    },
});

const server = new ApolloServer({
    typeDefs: TypeDef,
    resolvers: [nineQueries, {
        Date: dateScalar,
        JSON: GraphQLJSON
    }] as any,
    introspection: true
})


const app = await startStandaloneServer(server, {
    context: async ({ req, res }) => {

        return {
            req,
            res
        }
    },
    listen: {
        port: (process.env.PORT! || 4000) as any
    },

})


console.log(`SERVER LIVE AT: ${app.url}`)