import { ApolloServer} from 'apollo-server-micro'
import {schema as typeDefs} from '../../queries'

const resolvers = {
  Query: {
    getLoggedInUser(p,a,ctx){
          return {
            userName:"String",
            realName:"String",
            email:"String@string",
            category:"consultant",
            isAdmin:true
          }
      },
    getProject() {return null},
    projectList(){return []},
    allUsers() {return []},
    getUser(){return null}
  }
}

const apolloServer = new ApolloServer({ typeDefs, resolvers,formatError: error => {
    console.log(error);
    return error;
  },
  formatResponse: response => {
    console.log(response);
    return response;
  }, })

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })