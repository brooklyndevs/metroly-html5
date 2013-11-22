/* Karma includes all configured files into window.__karma__.files */
var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

require.config({

  baseUrl: '/base/js',

  deps: tests,

  paths: {
    jquery: '../assets/libs/jquery.min',
    underscore: '../assets/libs/underscore.min',
    backbone: '../assets/libs/backbone.min',
    handlebars: '../assets/libs/handlebars',
    leaflet: '../assets/libs/leaflet-0.6.4/leaflet',
    markerCluster: '../assets/libs/leaflet-markerCluster/leaflet.markercluster',
    busesnyc: '../assets/libs/busesNYC',
    shortpoll: 'helpers/poller',
    storage: 'services/storage',
    accordion: 'accordion',
    appState: 'services/appState',
    config: 'config',
    oba: 'oba',
    eventStack: 'eventStack'
  },

  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    handlebars: {
      exports: 'Handlebars',
      // Needed for Handlebars to work
      // https://github.com/gruntjs/grunt-contrib-handlebars/issues/48
      init: function() {
        this.Handlebars = Handlebars;
        return this.Handlebars;
      }
    },
    leaflet: {
      exports: 'L'
    },
    markerCluster: {
      deps: ['leaflet'],
      exports: 'L.MarkerClusterGroup'
    },
    busesnyc: {
      deps: ['jquery'],
      exports: 'MtaBusTime'
    },
    shortpoll: {
      deps: ['jquery'],
      exports: 'ShortPoll'
    }
  },

  callback: window.__karma__.start
});