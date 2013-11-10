/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'underscore',
  'backbone',
  'busesnyc',
  'oba'
], function (_, Backbone, MtaBusTime, OneBusAway) {

  var MapModel = Backbone.Model.extend({
    defaults: {
      bus: undefined,
      direction: 0,
      route: {}
    },

    initialize: function () {
      var apiKey = this.get('apiKey');
      this.mta = new MtaBusTime(apiKey);
      this.busesChangedCbs = [];
      this.routeChangedCbs = [];
      this.on('change:bus', this.getBuses, this);
      this.on('change:bus', this.getRoute, this);
      this.on('change:bus', this.getStops, this);
    },

    resetBus: function () {
      this.unset('bus');
    },

    getBuses: function () {

      var bus = this.get('bus'),
          dir = this.get('direction'),
          self = this;

      if (bus) {
        // why? live spinner? I think it works without it.
        // TODO Find the other place that causes the spinner to spin.
        // Makes more sense to trigger an event to spin/unspin from this model.
        this.trigger('getBuses');

        console.log("getBuses(). Bus: [", bus, '] Direction: ', dir);

        this.mta.getBuses(bus, dir, function (buses) {
          self.trigger('gotBuses', buses);
        });
      }
    },

    getRoute: function () {

      var bus = this.get('bus'),
          self = this;

      if (bus) {
        this.mta.getRoute(bus, function (route) {
          route.directions = _.sortBy(route.directions, function (direction) {
            return direction.directionId;
          });
          self.set('route', route);
        });
      }
    },

    getStops: function () {
      var self = this;
      OneBusAway.getBusStops(self.get('bus'), function (stops) {
        console.log('OBA called back', stops);
        self.trigger('gotStops', stops);
      });
    },

    onBusesChanged: function (cb, ctx) {
      this.busesChangedCbs.push(_.bind(cb, ctx));
    },

    notifyBusesChanged: function (buses) {
      var i, cbs = this.busesChangedCbs, cbsLength = cbs.length;
      for (i = 0; i < cbsLength; i += 1) {
        cbs[i](buses);
      }
    }

  });

  return MapModel;
});