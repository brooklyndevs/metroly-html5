/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var GeoModel = Backbone.Model.extend({
    defaults: {
      active: false
    },

    initialize: function () {
      console.log("Geo Model Created");

    },

    toggleActive: function () {
      console.log("Geo BTN Clicked");
      this.set('active', !this.get('active'));
    }

  });

  return GeoModel;
});