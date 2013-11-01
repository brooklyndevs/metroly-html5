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

      release: {

        options: {

          // Calls require()/config() calls from main.js file
          mainConfigFile: "js/main.js",

          // Generate Source Maps to transfer minified JS to non-minified JS ("optimize" call)
          generateSourceMaps: true,
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
        files: {
          "dist/assets/css/style.css": ["assets/css/*.css"]
        }
      }
    },

    server: {
      options: {
        host: "0.0.0.0",
        port: 8000
      },

      development: {},

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
          { src: ["favicon.ico"], dest: "dist/" },
          // All the JS files
          { src: ["js/**"], dest: "dist/" },
                  // Vendor files   Exclude CSS files (cssmin will get them), exclude Old Images
          { src: ["assets/**",      "!**assets/css/**", "!**assets/images/icon_set/old/**"],  dest: "dist/" },
          // Almond for AMD - helps mobile devices
//          { src: "node_modules/almond/almond.js", dest: "dist/js/almond.js" }
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
    /*
    karma: {
      options: {
        basePath: process.cwd(),
        singleRun: true,
        captureTimeout: 7000,
        autoWatch: true,
        logLevel: "ERROR",

        reporters: ["dots", "coverage"],
        browsers: ["PhantomJS"],

        // Change this to the framework you want to use.
        frameworks: ["mocha"],

        plugins: [
          "karma-jasmine",
          "karma-mocha",
          "karma-qunit",
          "karma-phantomjs-launcher",
          "karma-coverage"
        ],

        preprocessors: {
          "js/**\/*.js": "coverage"
        },

        coverageReporter: {
          type: "lcov",
          dir: "test/coverage"
        },

        files: [
          // You can optionally remove this or swap out for a different expect.
          "vendor/bower/chai/chai.js",
          "vendor/bower/requirejs/require.js",
          "test/runner.js",

          { pattern: "app/**\/*.*", included: false },
          // Derives test framework from Karma configuration.
          {*/
            //pattern: "test/<%= karma.options.frameworks[0] %>/**/\*.spec.js",
            //included: false
          //},
          //{ pattern: "vendor/**/*.js", included: false }
        //]
      //},


      // This creates a server that will automatically run your tests when you
      // save a file and display results in the terminal.
      /*daemon: {
        options: {
          singleRun: false
        }
      },

      // This is useful for running the tests just once.
      run: {
        options: {
          singleRun: true
        }
      }
    },*/

    coveralls: {
      options: {
        coverage_dir: "test/coverage/PhantomJS 1.9.2 (Linux)/"
      }
    }
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
    "requirejs",        // Minify JS files using R.js & Require.js & add AMD definition through Almond
    
    "processhtml",      // Process HTML - build scripts (ex. combines all references into one), images

    //"compress"          // gzip js, css - Should be done by Node

    //"server:release"    // Run release server
  ]);
};