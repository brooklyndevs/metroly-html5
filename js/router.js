/*global define */

define(['jquery', 'backbone', 'domReady', 'appState'], function ($, Backbone, domReady, appState) {
  "use strict";

  var Router, self = this;

  Router = Backbone.Router.extend({
    routes: {
      '': 'homeState',
      'buses/:bus': 'selectBus',
      'bus/:bus/:dir': 'selectDirection',
      '*default': 'default'
    }
  });

  Router.initialize = function () {

    var router = new Router();

    appState.init(function () {

      console.log('Storage settings: ', appState.getSettings());
      console.log('Storage buses: ', appState.getBuses());

      console.log('Before requiring APP');

      require(['application'], function (App) {
        console.log('App required');
        var app = new App();

        router.on('route:homeState', function () {
          console.log('in home state');
          app.selectBus('b63');
        });

        router.on('route:selectBus', function (bus) {
          app.selectBus(bus);
        });

        Backbone.history.start({pushState: false});
      });
      console.log('After requiring APP');
    });
  };

  return Router;
});




