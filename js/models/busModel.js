/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'underscore',
  'backbone',
  'busesnyc',
  'oba',
  'appState'
], function (_, Backbone, MtaBusTime, OneBusAway, appState) {

  var BusModel = Backbone.Model.extend({
    // Vars for the bus specifications Defaults
    defaults: {
      bus: undefined, // Bus id
      direction: 0, // Direction of the bus
      currentStop: null // The current stop where the bus is at now
    },

    initialize: function () {
      var apiKey = this.get('apiKey');
      this.mta = new MtaBusTime(apiKey);
      this.busesChangedCbs = [];
      this.on('change:bus', this.getBuses, this);
    },

    resetBus: function () {
      this.unset('bus');
    },

    getBuses: function () {

      console.log("MapModel.getBuses -> mta.getBuses [0]");

      var bus = this.get('bus'),
          dir = this.get('direction'),
          self = this;

      
      if (bus) {
        // why? live spinner? I think it works without it.
        // TODO Find the other place that causes the spinner to spin.
        // Makes more sense to trigger an event to spin/unspin from this model.
        this.trigger('getBuses');

        console.log("MapModel.getBuses -> mta.getBuses [1] Bus route: [", bus, '] Direction: ', dir);

        this.mta.getBuses(bus, dir, function (buses) {
          self.trigger('showBuses', buses);
        });
      }
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

  return BusModel;
});