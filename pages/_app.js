import React from 'react'

  
import App from 'next/app'
import Head from 'next/head'
import {SigninAssistant} from '../lib/signin'
import TopNav from '../components/topnav.js'
import {Grid} from 'semantic-ui-react'
import { ApolloClient, HttpLink, InMemoryCache,ApolloProvider } from '@apollo/client';
import withApollo from 'next-with-apollo'

class MyApp extends App {
  
  render () {
	const { Component, pageProps,apollo} = this.props
	return (<>
		<ApolloProvider client={apollo}><SigninAssistant>
			<div>
				<TopNav showbuttons={true}/>
				<Grid>		
					<Grid.Column width={1}/>
					<Grid.Column width={14}>
						<Component  {...pageProps} />              
					</Grid.Column>
					<Grid.Column width={1}/>
				</Grid>
			</div>
			<Head>
				<title>QEUH QI Exchange</title>    
				<link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.1.1/firebaseui.css" />
				<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
			</Head>
		</SigninAssistant></ApolloProvider>
	</>
)
}
}

export default withApollo(
  ({ ctx, headers, initialState }) =>
    new ApolloClient({
		link:HttpLink({uri: `${ctx.req?'http://localhost:3000':''}/api/graphql`}),
		ssrMode:!!ctx.req,
		cache: new InMemoryCache().restore(initialState || {})
    })
)(MyApp)

