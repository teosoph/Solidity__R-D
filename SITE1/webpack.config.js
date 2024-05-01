const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development", // Change to 'production' when deploying for production

    entry: path.resolve(__dirname, "backend", "js", "app.js"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/", // Это гарантирует правильные пути для файлов после сборки
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"], // Это позволяет вам import './style.css' в JavaScript
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./frontend/index.html",
        }),
    ],
};
