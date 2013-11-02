module.exports = function(grunt) {

  "use strict";

  grunt.initConfig({

    // Wipe out previous builds and test reporting.
    clean: ["dist/", "test/reports"],

    // Run your source code through JSHint's defaults.
    jshint: ["js/**/*.js"],

    // This task uses James Burke's excellent r.js AMD builder to take all
    // modules and concatenate them into a single file.
    requirejs: {

      options: {
          // Calls require()/config() calls from main.js file
          mainConfigFile: "js/config.js",
        
          include: ["main"],
          insertRequire: ["main"],
          out: "dist/js/main.js",
          optimize: "uglify2",
          // Since we bootstrap with nested `require` calls this option allows
          // R.js to find them.
          findNestedDependencies: true,

          // Include a minimal AMD implementation shim (in shim files).
          name: "../node_modules/almond/almond",

          // Setting the base url to the distribution directory allows the
          // Uglify minification process to correctly map paths for Source
          // Maps.
          baseUrl: "js",

          // Wrap everything in an IIFE.
          wrap: true,

          // Do not preserve any license comments when working with source
          // maps.  These options are incompatible.
          preserveLicenseComments: false,

          // Remove combined files from the dist folder
          removeCombined: true
      },

      release: {
        options: {
          // No need for source maps in javacript
          generateSourceMaps: false,
        }
      },
      develop: {
        options: {
          // Generate Source Maps to transfer minified JS to non-minified JS ("optimize" call)
          generateSourceMaps: true,        
        }
      }
    },

    // This task simplifies working with CSS inside Backbone Boilerplate
    // projects.  Instead of manually specifying your stylesheets inside the
    // HTML, you can use `@imports` and this task will concatenate only those paths.
    /*
    styles: {
      // Out the concatenated contents of the following styles into the below
      // development file path.
      "dist/assets/css/style.css": {

        // Point this to where your `index.css` file is location.
        src: "dist/assets/css/style.css",

        // The relative path to use for the @imports.
        paths: ["assets/css"],

        // Rewrite image paths during release to be relative to the `img` directory.
        forceRelative: "/assets/images/"
      }
    },*/

    // Minify the distribution CSS.
    cssmin: {
      release: {
        options: {
          banner: '/* Metroly CSS */'
        },
        files: {											// Add Leaflet to style (make sure it's before script!)
          "dist/assets/css/style.css": ["assets/libs/leaflet/leaflet.css","assets/css/*.css"]
        }
      }
    },

    server: {
      options: {
        host: "0.0.0.0",
        port: 8000
      },

      development: {
      },

      release: {
        options: {
          prefix: "dist"
        }
      },

      test: {
        options: {
          forever: false,
          port: 8001
        }
      }
    },

    processhtml: {
      release: {
        files: {
          "dist/index.html": ["index.html"]
        }
      }
    },

    // Move vendor and app logic during a build.
    copy: {
      release: {
        files: [
          // Meetroly icon ftw!
          { 
            src: ["favicon.ico"], dest: "dist/" 
          },
          // Vendor files, Exclude CSS files (cssmin will get them), exclude Old Images
          { src: [
              "assets/**",
              "!**assets/css/**",
              "!**assets/libs/leaflet/leaflet.css",
              "!**assets/images/icon_set/old/**"
            ],  
            dest: "dist/" 
          }
        ]
      }
    },


    compress: {
      release: {
        options: {
          mode: 'gzip' // also 'zip','gz'
          //archive: "dist/js/main.js.gz"
        },
        files: [
          {
            expand: true, 
            src: ["dist/js/main.js", "dist/assets/libs/require.min.js"],
            ext: ".js.gz"
          }
        ]
      }
    },

    // Unit testing is provided by Karma.  Change the two commented locations
    // below to either: mocha, jasmine, or qunit.
     karma: {
      options: {

        host: "localhost",
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        // CLI --colors --no-colors
        colors: true,
        
        // base path, that will be used to resolve files and exclude
        basePath: "",
        
        // Change this to the framework you want to use.
        frameworks: [
          "jasmine", 
          "requirejs"
        ],

        // Auto run tests on start (when browsers are captured) and exit
        // CLI --single-run --no-single-run
        singleRun: true,

        // If browser does not capture in given timeout [ms], kill it
        // CLI --capture-timeout 5000
        captureTimeout: 15000,

        // enable / disable watching file and executing tests whenever any file changes
        // CLI --auto-watch --no-auto-watch
        autoWatch: true,
        
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        // CLI --log-level debug
        //logLevel: "ERROR",

        //reporters: [
          //"dots", 
          //"coverage"
        //], //also "growl", "junit", "progress"

        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        // - /usr/bin/chromium-browser - your own stuff (Chromium per se)
        browsers: ["PhantomJS", "Chrome"],


        plugins: [
          "karma-jasmine", 
          "karma-mocha", 
          //"karma-qunit",
          "karma-phantomjs-launcher",
          'karma-chrome-launcher',
          //'karma-firefox-launcher',
          "karma-coverage",
          "karma-requirejs"
        ],

        // Files that needs to be preprocessed
        //preprocessors: { "js/**/*.js": "coverage" },

        //coverageReporter: {
        //  type: "lcov",
        //  dir: "test/coverage"
        //},

        //loggers: [
        //  { type: 'console'},
        //  { type: 'file', filename: 'test/logs/log.log' }
        //],

        // list of files / patterns to load in the browser
        files: [
          //"node_modules/chai/chai.js",

          // false because we want to use require.js to serve these files
          { pattern: "assets/libs/**/*.js", included: false },
          { pattern: "js/**/*.js",     included: false },

          //{ pattern: "test/<%= karma.options.frameworks[0] %>/**/*.js", included: false },
          { pattern: "test/jasmine/specs/boilerplate/router.spec.js", included: false },

          'test/test-main.js'
        ],

        // list of files to exclude
        exclude: [
          "js/main.js"
        ],

      },

      // This creates a server that will automatically run your tests when you
      // save a file and display results in the terminal.
      //daemon: {
      //  options: {
      //    singleRun: false
      //  }
      //},

      // This is useful for running the tests just once.
      run: {
        options: {
          singleRun: true
        }
      }
    },

    coveralls: {
      options: {
        coverage_dir: "test/coverage/PhantomJS 1.9.2 (Linux)/"
      }
    },

    strip : {
      main : {
        // Remove comments from all js files in dist
        src : 'dist/**/*.js',
        options : {
          inline : true
        }
      }
    },

  });

  // Grunt contribution tasks.
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-compress");

  // Third-party tasks.  Karma = Testacular
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks("grunt-karma-coveralls");
  grunt.loadNpmTasks("grunt-processhtml");
  grunt.loadNpmTasks('grunt-strip');

  // Grunt BBB tasks.
  grunt.loadNpmTasks("grunt-bbb-server");
  grunt.loadNpmTasks("grunt-bbb-requirejs");
  grunt.loadNpmTasks("grunt-bbb-styles");

  // When running the default Grunt command, just lint the code.
  grunt.registerTask("default", [

    "jshint",			      // Test JavaScript for errors
    
    "clean",            // Clean old Dist folder
    "copy",             // Copy files to Dist folder
    
    "cssmin",           // Unite & Minify CSS file (style.css)
    
    "requirejs:release",// Minify JS files using R.js & Require.js & add AMD definition through Almond
    
    "strip",            // Removes console.log, debug statements and such
    
    "processhtml",      // Process HTML - build scripts (ex. combines all references into one), images

    //"compress"          // gzip js, css - Should be done by Node
    //"server:release"    // Run release server
    //"karma:run"       // Single run of karma testing suite
  ]);
};