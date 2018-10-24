const {makeExecutableSchema} = require('graphql-tools'),
  rp = require('request-promise'),
  graphqlHTTP = require('express-graphql');

module.exports = app => {
  /**
   * Our root schema for graphQL.
   */
  const BaseQuery = `
  type Brewery {
    id: Int
    name: String
    brewery_type: String
    street: String
    city: String
    state: String
    postal_code: String
    country: String
    longitude: String
    latitude: String
    phone(prefix: String): String
    website_url: String
    updated_at: String
  }
  
  type Query {
    ping: String
    breweries: [Brewery]
  }
  
  type Mutation {
    _empty: String
  }
`;

  const resolvers = {
    Brewery: {
      async phone(brewery, {prefix}, req) {
        return `${prefix || 'TEL'}: ${brewery.phone}`;
      },
    },
    Query: {
      async ping(parentValue, {}, req, info) {
        return 'pong';
      },
      async breweries(parentValue, {}, req, info) {
        return JSON.parse(await rp('https://api.openbrewerydb.org/breweries?by_state=CA'));
      },
    }
  };

  /**
   * Generate the GraphQLSchema.
   */
  const schema = makeExecutableSchema({
    typeDefs: [BaseQuery],
    resolvers
  });

  /**
   * Enable the graphql endpoints
   */
  app.use(
    '/graphql',
    graphqlHTTP({schema: schema, graphiql: true})
  );
};
