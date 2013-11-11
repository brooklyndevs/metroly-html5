require.config({
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
    oba: 'oba'
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
  }
});

define([], function () {

  var config = {
    CHECK_UPDATES_DAYS: 3,
    CHECK_INTERVAL_DEFAULT: 15,
    BUSES_URL: 'http://www.metrolyapp.com/v1/buses/nyc?callback=?',
    CHECK_INTERVAL_SETTING: "check_interval",
    LAST_UPDATED_SETTING: 'last_updated'
  };

  return config;

});