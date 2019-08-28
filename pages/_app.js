import React from 'react'
import {Provider} from 'react-redux'
import {createStore,combineReducers, applyMiddleware } from 'redux-dynamic-modules'
import {getThunkExtension} from 'redux-dynamic-modules-thunk'
import {getSagaExtension} from 'redux-dynamic-modules-saga'

  
import App, { Container } from 'next/app'
import Head from 'next/head'
import {SigninAssistant} from '../lib/signin'
import TopNav from '../lib/topnav.js'
import {Col} from 'react-bootstrap'
import {Grid} from 'semantic-ui-react'
import Router from 'next/router'
import {CookiesProvider,Cookies} from 'react-cookie'
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
    //UsersModule
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
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    if (ctx.req){
      //console.log(ctx.req.universalCookies)
      pageProps._cookies=ctx.req.universalCookies
    }

    return { pageProps }
  }

  render () {
	  console.log('app page')
    const { Component, pageProps, store } = this.props
    store.dispatch(()=>{console.log('thunk?')})
    var maybeCookies={}
    if (pageProps._cookies) maybeCookies={cookies:new Cookies(pageProps._cookies.cookies)}
    //console.log(maybeCookies)
    return (
      <Container>
	  <Provider store={store}>
    <CookiesProvider {...maybeCookies}>
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
    </CookiesProvider>
    </Provider>
      </Container>
    )
  }
}

export default withRedux(makeStore)(MyApp)
    