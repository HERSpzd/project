const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    host: "localhost",
    historyApiFallback: true,
    allowedHosts: "all",
  },
});
