/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'underscore',
  'backbone',
  'busesnyc',
  'oba',
  'appState'
], function (_, Backbone, MtaBusTime, OneBusAway, appState) {

  var MapModel = Backbone.Model.extend({
    defaults: {
      bus: undefined, // Bus id
      route: {}, // Bus routes (uptown and downtown)
      stops: {} // All the stops for the current bus
    },

    // Initialize MapModel
    initialize: function () {
      var apiKey = this.get('apiKey');
      this.mta = new MtaBusTime(apiKey);
      this.routeChangedCbs = [];
      this.on('change:bus', this.getRoute, this);
    },


    // Get Route from "MtaBusTime"
    getRoute: function () {
      console.log("MapModel.getRoute -> mta.getRoute");
      var bus = this.get('bus'),
          self = this,
          storedBus;

      if (bus) {
        storedBus = appState.getBus(bus) || {name: bus};
        storedBus.shortName = storedBus.name;
        // self.set('route', storedBus);

        this.mta.getRoute(bus, function (route) {
          route.directions = _.sortBy(route.directions, function (direction) {
            return direction.directionId;
          });

          console.log("MapModel.getRoute -> mta.getRoute [1]. Route:", route);

          self.set('route', route);
          self.getStops();
        });
      }
    },

    // Get bus stops for "OneBusAway"
    getStops: function () {
      var self = this;
      OneBusAway.getBusStops(self.get('bus'), function (stops) {
        console.log('Got stops:', stops);
        self.trigger('gotStops', stops);
      });
    }

  });

  return MapModel;
});