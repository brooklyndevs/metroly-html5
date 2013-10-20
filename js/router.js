/*global define */

define(['jquery', 'backbone', 'application', 'domReady', 'storage'], function ($, Backbone, App, domReady, Storage) {
  "use strict";

  domReady(function () {
    require(['metrolyUi']);
  });

  var initAppState = function () {
    var CHECK_UPDATES_DAYS = 3;
    var appInfo = Storage.get('appInfo'),
      lastUpdated = appInfo.data.last_updated;
    if (!lastUpdated || (new Date(lastUpdated)) >= (Date.getDate() - CHECK_UPDATES_DAYS)) {
      console.log('Checking for updated information');
    }
  };

  // XX TODO Find a better place to put this.
  /* Query for available buses and save them to localStorage.
   * There's no need to do this on every startup, so let's do it
   * on the first time this app runs and then every X days.
   */
  var queryAvailableBuses = function () {
    console.log('Querying available buses');
    var appInfo = Storage.get('appInfo');
    if (!appInfo.data.buses_updated) {
      // It's the first run ever.
      var busQuery = $.ajax({
        url: 'http://www.metrolyapp.com/v1/buses/nyc?callback=?',
        dataType: 'jsonp'
      });

      busQuery.done(function (buses) {
        var busList = {};
        buses.forEach(function (bus) {
          busList[bus.name.toLowerCase()] = {name: bus.name, color: bus.color, recent: false, favorite: false};
        });

        var k, buses = Storage.get('buses');
        for (k in busList) {
          if (!buses[k]) {
            buses.data[k] = busList[k];
          }
        }

        buses.save();
        appInfo.insert('last_updated', new Date());
        appInfo.save();

      });

      busQuery.fail(function (err) {
        console.log('failed to get it ', err);
      });
    }
  };

  var Router, self = this;

  Router = Backbone.Router.extend({
    routes: {
      'bus/:bus': 'selectBus',
      'bus/:bus/:dir': 'selectDirection',
      '*default': 'default'
    }
  });

  Router.initialize = function () {
    var router = new Router();
    var app = new App();

    $(function () {  // TODO Move this into domReady(function () {...})

      initAppState();

    	app.selectBus('b61');

      router.on('route:selectBus', function (busline) {
        app.selectBus(busline);
      });

      router.on('route:selectDirection', function (bus, dir) {
        app.selectBus(bus);
        app.selectDirection(dir);
      });

      router.on('route:default', function (action) {
        app.toHomeState();
      });
    });

    Backbone.history.start({pushState: false});
  };

  return Router;
});