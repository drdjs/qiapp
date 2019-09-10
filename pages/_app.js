import React from 'react'
import {Provider} from 'react-redux'
import {createStore} from 'redux-dynamic-modules'
import {getThunkExtension} from 'redux-dynamic-modules-thunk'
import {getSagaExtension} from 'redux-dynamic-modules-saga'

  
import App, { Container } from 'next/app'
import Head from 'next/head'
import {SigninAssistant, setUserFromContext, getLoginModule} from '../lib/signin'
import TopNav from '../lib/topnav.js'
import {Grid} from 'semantic-ui-react'
import Router from 'next/router'
import withRedux from 'next-redux-wrapper'
import 'react-datepicker/dist/react-datepicker.css'

const makeStore = (initialState, options) => {
  const store = createStore(
    {
        initialState,
        extensions: [getThunkExtension(),getSagaExtension({})],
        //enhancers: [],
        //advancedCombineReducers: null
    },
    getLoginModule(options.isServer)
    /* ...any additional modules */
);
  console.log('store created')
  return store 
};


Router.events.on('routeChangeStart', url => {
  console.log('Navigating to:', url);
});

Router.events.on('routeChangeComplete', url => {
  console.log('Completed navigation to: ', url);
});
Router.events.on('routeChangeError',(err,url)=>{
  console.log('Error navigating to:',url)
  console.log(err)
})
class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    await setUserFromContext(ctx.store.dispatch,ctx)
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  render () {
	  console.log('app page')
    const { Component, pageProps, store } = this.props
    return (
      <Container>
	  <Provider store={store}>
	  <SigninAssistant>
	  <div>
	  <TopNav showbuttons={true}/>
			<Grid>		
					<Grid.Column width={1}/>
					<Grid.Column width={14}>
					<Component store={store} {...pageProps} />
                    
					</Grid.Column>
					<Grid.Column width={1}/>
          </Grid></div>
	  <Head>
	  <title>QEUH QI Exchange</title>    
	  <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.1.1/firebaseui.css" />
      <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"/>
    </Head>
        
	  </SigninAssistant>
    
    </Provider>
      </Container>
    )
  }
}

export default withRedux(makeStore)(MyApp)
    
