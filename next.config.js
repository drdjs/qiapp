const withCSS = require('@zeit/next-css')
const path=require('path')
module.exports = withCSS({
  webpack: function (config,{defaultLoaders,isServer,webpack}) {
	config.module.rules.push({
      test: /\.ifdef.js/,
      use: [
        defaultLoaders.babel,
        {
          loader: 'ifdef-loader',
          options: {isServer},
        },
      ],
    })
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    })
	
    return config
  }
})