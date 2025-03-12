var path = require('path');

module.exports = {
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["."],
        "alias": {
          "@dirty-matchbox/database": path.resolve(__dirname, "../../dist"),
          "@dirty-matchbox/database/*": path.resolve(__dirname, "../../dist/*"),
          "underscore": "lodash"
        }
      }
    ],
    "syntax-dynamic-import"
  ],
  "presets": [["env", { "modules": false }]],
  "env": {
    "test": {
      "plugins": ["dynamic-import-node"]
    }
  }
};
