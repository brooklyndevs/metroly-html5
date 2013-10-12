/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../../assets/templates/controls.html',
], function ($, _, Backbone, H, controlsTpl) {

  var Helpers = {
    visuallySelectRoute: function (jqTarget) {
      $('.route').removeClass('route-selected');
      jqTarget.addClass('route-selected');
    }
  };

  var ControlsView = Backbone.View.extend({
    el: '#control-panel',
    template: H.compile(controlsTpl),

    events: {
      'click .route': 'selectDirection',
      'click .tracking-status': 'toggleLive'
    },

    initialize: function () {
      this.model.on('change:bus', this.render, this);
      this.model.on('change:route', this.render, this);
      this.model.on('change:live', this.render, this);

    },

    toggleLive: function (e) {
      this.model.toggleLive();
    },

    selectDirection: function (e) {
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
      ctx.live = this.model.get('live');

      html = this.template(ctx);
      this.$el.html(html);

      Helpers.visuallySelectRoute($('[data-direction="0"]'));
      return this;
    }
  });

  return ControlsView;
});