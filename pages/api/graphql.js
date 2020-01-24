import { ApolloServer} from 'apollo-server-micro'
import {schema as typeDefs} from '../../queries'

import nedb from 'nedb'
const datastore={}
const resolvers = {
  Query: {
    getLoggedInUser(parent,args,ctx,info){
		console.log('logged-in user')
		console.log(ctx)
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