// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
// See https://github.com/zeit/next.js/issues/1245 for discussions on Universal Webpack or universal Babel
//const { createServer } = require('http')
//const { parse } = require('url')
const next = require('next')
const express = require('express')
const process = require('process')
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const expApp = express()
const handle = nextApp.getRequestHandler()
const cookiesMW = require('universal-cookie-express')
var admin = require("firebase-admin");
var serviceAccount = require("./credentials.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://qiexchange-223621.firebaseio.com"
});


nextApp.prepare()
expApp.use(cookiesMW())
expApp.use((req,res,next)=> {
    const idtoken=req.universalCookies.get('idtoken')
    req.adminInterface=admin
    //console.log('cookies:',req.universalCookies.getAll())
    if (idtoken){
        req.user=admin.auth().verifyIdToken(idtoken)
    }else{
        req.user=null
    }
    next()
})
expApp.all('*',(req, res) => {
    handle(req, res)
    })
expApp.listen(3000, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
