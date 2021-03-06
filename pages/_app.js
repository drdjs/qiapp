import React from 'react'

  

import Head from 'next/head'
import {SigninAssistant} from '../lib/signin'
import TopNav from '../components/topnav.js'
import {Grid} from 'semantic-ui-react'
import { ApolloClient, HttpLink, InMemoryCache,ApolloProvider } from '../lib/apollo';
import withApollo from 'next-with-apollo'

function MyApp ({ Component, pageProps,apollo}){
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
				<script crossorigin="anonymous" src="https://polyfill.io/v3/polyfill.min.js?features=es2015%2Ces2016%2Ces2017%2Ces2018"></script>
			</Head>
		</SigninAssistant></ApolloProvider>
	</>
)
}

 export default withApollo(
   ({ ctx, headers, initialState }) =>
     new ApolloClient({
		 link:new HttpLink({uri: `${(ctx && ctx.req)?'http://localhost:3000':''}/api/graphql`}),
		 ssrMode:!!(ctx && ctx.req),
		 cache: new InMemoryCache().restore(initialState || {})
     })
 )(MyApp)

