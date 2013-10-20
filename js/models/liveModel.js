/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var LiveModel = Backbone.Model.extend({
    defaults: {
      time:30
    },

    initialize: function () {
      console.log("Live Model Created");

    },
    
    setLiveTime: function (time) {
      console.log("Time: ", time);
      this.set('time', time);
    }
  });

  return LiveModel;
});