/*global define */

define(['jquery', 'backbone', 'application', 'domReady', 'storage'], function ($, Backbone, App, domReady, Storage) {
  "use strict";

  domReady(function () {
    require(['metrolyUi']);
  });

  var needsUpdate = function () {
    var CHECK_UPDATES_DAYS = 0;
    var appInfo = Storage.get('appInfo'),
      lastUpdated,
      expiration = new Date();

    if (appInfo.data.last_updated) {
     lastUpdated = new Date(appInfo.data.last_updated);
     expiration.setDate(lastUpdated.getDate() + CHECK_UPDATES_DAYS);
    }

    return !lastUpdated || lastUpdated >= expiration;
  };

  /* Query for available buses and save them to localStorage */
  var queryAvailableBuses = function (cb) {
    var appInfo = Storage.get('appInfo');

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
      cb && cb();
    });

    busQuery.fail(function (err) {
      console.log('failed to get it ', err);
      cb && cb();
    });
  };

  var initAppState = function (cb) {
    if (needsUpdate()) {
      console.log('Needs an update');
      queryAvailableBuses(cb);
    } else {
      console.log('Up to date');
      cb && cb();
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
    initAppState();
    var router = new Router();
    var app = new App();

    $(function () {  // TODO Move this into domReady(function () {...})
      app.selectBus('b63');

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