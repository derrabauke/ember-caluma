"use strict";

module.exports = {
  extends: ["recommended", "ember-template-lint-plugin-prettier:recommended"],
  plugins: ["ember-template-lint-plugin-prettier"],
  rules: {
    "no-bare-strings": true,
  },
};
