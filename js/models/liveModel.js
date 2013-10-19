/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var LiveModel = Backbone.Model.extend({
    defaults: {
      active: true
    },

    initialize: function () {
      console.log("Live Model Created");

    },

    toggleActive: function () {
      console.log("Live BTN Clicked");
      this.set('active', !this.get('active'));
    }

  });

  return LiveModel;
});