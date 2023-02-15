const path = require("path")
module.exports = {
    mode : process.env.NODE_ENV,
    entry : path.resolve(__dirname,"./server.js"),
    output : {
        path : path.resolve(__dirname, "dist"),
        filename : "bundle.js"
    }
}