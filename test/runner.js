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
    //baseUrl: "js"
  });

  require([
    "underscore"
    // We can require just one, "config" file if we get to it. 
    // We can then use it in main.js
    //"config",
  ],

  function(config, _) {
    var specs = _.chain(karma.files)
      // Convert the files object to an array of file paths.
      .map(function(id, file) { return file; })
      // Tests that end with `.spec.js' and existing either `app` or `test`
      // directories are automatically loaded.
      .filter(function(file) {
        //return /^\/base\/(app|test)\/.*\.spec\.js$/.test(file);
        return /^(js|test)\/.*\.spec\.js$/.test(file);
      })
      .value();

    // Load all specs and start Karma.
    require(specs, karma.start);
  });
})(this);
