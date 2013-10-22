/* Entry point for require.js */

require.config({
  paths: {
    jquery: '../assets/libs/jquery.min',
    underscore: '../assets/libs/underscore.min',
    backbone: '../assets/libs/backbone.min',
    handlebars: '../assets/libs/handlebars',
    leaflet: '../assets/libs/leaflet/leaflet',
    busesnyc: '../assets/libs/busesNYC',
    shortpoll: 'helpers/poller',
    storage: 'services/storage',
    accordion: 'accordion',
    appState: 'services/appState'
  },
  shim: {
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    underscore: {
      exports: '_'
    },
    handlebars: {
      exports: 'Handlebars'
    },
    leaflet: {
      exports: 'L'
    },
    busesnyc: {
      deps: ['jquery'],
      exports: 'MtaBusTime'
    },
    shortpoll: {
      deps: ['jquery'],
      exports: 'ShortPoll'
    }
  }
});

require(['router'], function (Router) {
  Router.initialize();
});