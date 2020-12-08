module.exports = {
    target: "node", // or 'node' or 'node-webkit'
    externals:{
        fs:    "commonjs fs",
        path:  "commonjs path",
    }
}
