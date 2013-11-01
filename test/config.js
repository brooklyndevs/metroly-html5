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
    appState: 'services/appState',
    config: 'config'
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