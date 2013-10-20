/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var LiveModel = Backbone.Model.extend({
    defaults: {
      active: true,
      time:30
    },

    initialize: function () {
      console.log("Live Model Created");

    },

    toggleActive: function () {
      console.log("Live BTN Clicked");
      this.set('active', !this.get('active'));
      this.set('time', this.get("time"));
    },

    setLiveTime: function (time) {
      console.log("Time: ", time);
      this.set('time', time);
    }
  });

  return LiveModel;
});