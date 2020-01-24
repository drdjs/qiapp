
const path=require('path')
module.exports = {
  webpack: function (config,{defaultLoaders,isServer,webpack}) {
	config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
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
}
