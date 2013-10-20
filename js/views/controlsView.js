/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../../assets/templates/controls.html',
  'views/favoriteView',
  'storage'
], function ($, _, Backbone, H, controlsTpl, FavoriteView, Storage) {

  var storage = Storage.get('buses');

  var Helpers = {
    visuallySelectRoute: function (jqTarget) {
      $('.route').removeClass('route-selected');
      jqTarget.addClass('route-selected');
    }
  };

  var ControlsView = Backbone.View.extend({
    el: '#header-wrapper',
    template: H.compile(controlsTpl),

    events: {
      'click .route': 'selectDirection',
      'click .tracking-status': 'toggleLive',
    },

    initialize: function () {
      this.model.on('change:bus', this.render, this);
      this.model.on('change:route', this.render, this);
    },

    favorite: function (e) {
      var selectedBus = this.model.get('bus');
      storage.toggle(selectedBus, selectedBus);
      storage.save();

      console.log('State of storage: ', storage.data);
    },

    selectDirection: function (e) {
      e.preventDefault();
      var target = $(e.target),
        direction = target.data('direction');

      Helpers.visuallySelectRoute(target);

      console.log('Selected direction', direction);
      this.model.set('direction', direction);
    },

    render: function () {
      var html, ctx = {};
      ctx.route = this.model.get('route');
      ctx.direction = this.model.get('direction');

      html = this.template(ctx);
      this.$el.html(html);

      Helpers.visuallySelectRoute($('[data-direction="0"]'));

      var isFav = storage.contains(this.model.get('bus'));
      this.favoriteBtn = new FavoriteView({
        el: "#app-controls",
        model: new (Backbone.Model.extend({ defaults: {isActive: isFav}}))
      });
      this.favoriteBtn.model.on('change:isActive', this.favorite, this);
      this.favoriteBtn.render();

      return this;
    }
  });

  return ControlsView;
});