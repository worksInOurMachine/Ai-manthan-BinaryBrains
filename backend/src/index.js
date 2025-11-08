"use strict";

module.exports = {
  register(/*{ strapi }*/) {},

  bootstrap(/*{ strapi }*/) {
    // Catch and ignore Windows EPERM unlink errors from temp file cleanup
  },
};
