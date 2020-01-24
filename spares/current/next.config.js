const withCSS = require('@zeit/next-css')
const path=require('path')
module.exports = withCSS({
  webpack: function (config,ctx) {
	if (ctx.isServer){
    config.resolve.alias.variable = path.join(__dirname,'serveronly')
    }else{
	config.resolve.alias.variable= path.join(__dirname,'clientonly')
		}
	
    return config
  }
})