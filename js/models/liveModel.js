/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'underscore',
  'backbone',
  'appState'
], function (_, Backbone, appState) {

  var CHECK_INTERVAL = 'check_interval';
  var settings = appState.getSettings();

  var LiveModel = Backbone.Model.extend({
    defaults: {
      time:30
    },

    initialize: function () {
      console.log("Live Model Created");
      this.on('change:time', this.timeChanged, this);
      var interval = settings.find(CHECK_INTERVAL);
      if (!interval) {
        var defaultTime = settings.find(CHECK_INTERVAL);
        this.model.set('time', defaultTime, {silent: true});
        console.log('settings', settings);
      }
      this.set('time', interval);
    },

    timeChanged: function () {
      settings.insert(CHECK_INTERVAL, this.get('time'));
      settings.save();
    },

    setLiveTime: function (time) {
      console.log("Time: ", time);
      this.set('time', time);
    }
  });

  return LiveModel;
});