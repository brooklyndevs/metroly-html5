/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../../assets/templates/controls.html',
  'views/favoriteView',
  'appState'
], function ($, _, Backbone, H, controlsTpl, FavoriteView, appState) {

  var storage = appState.getBuses();

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
      'click #menu-btn': 'menuClicked'
    },

    initialize: function () {
      this.model.on('change:bus', this.render, this);
      this.model.on('change:route', this.render, this);
    },

    menuClicked: function () {
      var pages = document.querySelectorAll('.page');
      pages = Array.prototype.splice.call(pages, 0);
      pages.forEach(function (pg) {
        pg.style.webkitTransition = "margin-left .4s";

        if (pg.style.marginLeft.trim().length > 0) {
          pg.style.marginLeft = "";
        } else {
          pg.style.marginLeft = "200px";
        }
      });
      return false;
    },

    favorite: function (e) {
      var selectedBus = this.model.get('bus');
      console.log('SelectedBus: ', selectedBus);
      var busData = storage.data[selectedBus.toLowerCase()];
      busData.favorite = !busData.favorite;
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
      var currBus = this.model.get('bus')

      var html, ctx = {};
      ctx.route = this.model.get('route');

      console.log("The route here: ", ctx.route);

      
      ctx.direction = this.model.get('direction');

      if (ctx.route.directions) {
        _.each(ctx.route.directions, function (direction) {
          if (direction.destination) {
            var editedDestination = direction.destination.split('via')[0];
            direction.destination = editedDestination;
          }
        });
      }

      html = this.template(ctx);
      this.$el.html(html);

      Helpers.visuallySelectRoute($('[data-direction="0"]'));
      var bus = storage.find(currBus.toLowerCase());
      var isFav = bus.favorite || false;
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