/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../../assets/templates/geobtn.html',
], function ($, _, Backbone, H, controlsTpl) {


  var GeoView = Backbone.View.extend({
    el: '#geoContainer',
    template: H.compile(controlsTpl),

    events: {
      'click #geo-btn': 'toggleActive'
    },

    initialize: function () {
      console.log("Geo view Created");
      this.render();
      this.model.on('change:active', this.render, this);
    },

    toggleActive: function (e) {
      //console.log("ToggleActive  Clicked");
      console.log(this.model.toggleActive);
      this.model.toggleActive();
    },

    render: function () {
      console.log("geo view rendering");
      var html, ctx = {};

      ctx.active = this.model.get('active');

      html = this.template(ctx);

      this.$el.html(html);

      // return this;
    }
  });

  return GeoView;
});