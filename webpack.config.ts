import * as CopyWebpackPlugin from "copy-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as Path from "path";
import { Configuration, Plugin } from "webpack";
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

module.exports = (env: any) : Configuration => {
  const ENV_DEVELOPMENT = env.NODE_ENV === "development";
  const ENV_PRODUCTION = env.NODE_ENV === "production";

  const plugins: Plugin[] = [
    new HtmlWebpackPlugin({
      template: "index-template.html",
      inject: "head",
      env: env.NODE_ENV,
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: "defer",
    }),
    new CopyWebpackPlugin([
      { from: "assets" },
    ]),
    new FaviconsWebpackPlugin({
      logo: "./favicon.png",
      persistentCache: !ENV_PRODUCTION,
    }),
    new MiniCssExtractPlugin({
      filename: (ENV_PRODUCTION) ? "styles.[contenthash].css" : "styles.css",
    }),
  ];

  return {
    context: Path.resolve(__dirname, 'src'),
    entry: "./index.tsx",
    output: (ENV_PRODUCTION)
    ? {
      path: Path.resolve(__dirname, "docs"),
      filename: "scripts.[contenthash].js",
    } : {
      path: Path.resolve(__dirname, "build"),
      filename: "scripts.js",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader"
          ],
        },
      ],
    },
    resolve: {
      modules: [
        Path.resolve(__dirname, "src"),
        "node_modules",
      ],
      extensions: [".tsx", ".ts", ".jsx", ".js", ],
    },
    mode: env.NODE_ENV,
    devtool: (ENV_PRODUCTION) ? "source-map" : "inline-source-map",
    plugins: plugins,
    externals: {
      "react": "React",
      "react-dom": "ReactDOM",
      "firebase" : "firebase",
    },
  }
};
