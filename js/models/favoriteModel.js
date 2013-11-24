/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var FavoriteModel = Backbone.Model.extend({
    defaults: {
      active: false
    },

    initialize: function () {
      console.log("Fav Model Created");
    }

  });

  return FavoriteModel;
});