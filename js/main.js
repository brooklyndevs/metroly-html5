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
    metrolySideNav: 'side-nav', // XX Put inside of metroly-ui
    metrolyUi: 'https://rawgithub.com/brooklyndevs/metroly-ui/master/metroly-ui',
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
    },
    metrolyUi: {
      deps: ['metrolySideNav'], // XX Put this into metrolyui
      exports: 'MetrolyUi'
    }
  }
});

require(['router'], function (Router) {
  Router.initialize();
});