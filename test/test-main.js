var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}


/*
  window.__karma__.files = {
    '/base/node_modules/karma-requirejs/lib/require.js': '1375082464000',
    '/base/node_modules/karma-requirejs/lib/adapter.js': '1375781077000',
    '/base/node_modules/karma-jasmine/lib/jasmine.js': '1374365571000',
    '/base/node_modules/karma-jasmine/lib/adapter.js': '1377413713000',
    '/base/assets/libs/backbone.min.js': '1383099337000',
    '/base/assets/libs/busesNYC.js': '1383099337000',
    '/base/assets/libs/handlebars.js': '1383099337000',
    '/base/assets/libs/jquery.min.js': '1383099337000',
    '/base/assets/libs/leaflet/leaflet.js': '1383099337000',
    '/base/assets/libs/require.min.js': '1383099337000',
    '/base/assets/libs/underscore.min.js': '1383099337000',
    '/base/js/accordion.js': '1383265926000',
    '/base/js/application.js': '1383099337000',
    '/base/js/busData.js': '1383099337000',
    '/base/js/config.js': '1383342539000',
    '/base/js/coverage/Chromium 28.0.1500 (Ubuntu)/prettify.js': '1383345455000',
    '/base/js/domReady.js': '1383262870000',
    '/base/js/helpers/poller.js': '1383099337000',
    '/base/js/models/geoModel.js': '1383099337000',
    '/base/js/models/liveModel.js': '1383099337000',
    '/base/js/models/mapModel.js': '1383099337000',
    '/base/js/router.js': '1383099337000',
    '/base/js/services/appState.js': '1383263039000',
    '/base/js/services/storage.js': '1383263075000',
    '/base/js/text.js': '1383099337000',
    '/base/js/views/accordionView.js': '1383263125000',
    '/base/js/views/controlsView.js': '1383267228000',
    '/base/js/views/favoriteView.js': '1383099337000',
    '/base/js/views/geoView.js': '1383099337000',
    '/base/js/views/liveView.js': '1383099337000',
    '/base/js/views/mapView.js': '1383263210000',
    '/base/test/jasmine/specs/boilerplate/router.spec.js': '1383334542000',
    '/base/test/test-main.js': '1383348570000'
  };
*/










/*()
requirejs.config({
  
  // Karma serves files from '/base'
  baseUrl: '/base/js',

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
  },

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});*/


(function(window) {
  "use strict";

  var karma = window.__karma__;

  // Put Karma into an asynchronous waiting mode until we have loaded our
  // tests.
  karma.loaded = function() {};

  if (window.QUnit) {
    // Disable auto start.  We'll call start once the async modules have
    // loaded.
    window.QUnit.config.autostart = false;
  } else if (window.chai) {
    // Optionally use chai with Mocha.
    window.expect = window.chai.expect;
  }

  // Set the application endpoint and load the configuration.
  require.config({
    paths: {
      //underscore: "../assets/libs/underscore.min.js"
    },

    baseUrl: "base/js"
  });

  require([
    "config",
    "underscore"
  ],

  function(config, _) {
    var specs = _.chain(karma.files)
      // Convert the files object to an array of file paths.
      .map(function(id, file) { return file; })
      // Tests that end with `.spec.js' and existing either `app` or `test`
      // directories are automatically loaded.
      .filter(function(file) {
        return /^\/base\/(js|test)\/.*\.spec\.js$/.test(file);
      })
      .value();

    // Load all specs and start Karma.
    require(specs, karma.start);
  });
})(this);