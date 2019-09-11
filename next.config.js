const withCSS = require('@zeit/next-css')
const path=require('path')
module.exports = withCSS({
  webpack: function (config,{isServer,webpack}) {
	if (isServer){
    config.resolve.alias.variable = path.join(__dirname,'serveronly')
    config.plugins.push(new webpack.DefinePlugin({'process.env.NODE_ENV':JSON.stringify('production')}))
    }else{
	config.resolve.alias.variable= path.join(__dirname,'clientonly')
		}
	
    return config
  }
})