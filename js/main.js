/* Entry point for require.js */

require(["config"], function() {

  require(['router'], function (Router) {
    Router.initialize();
  });

});