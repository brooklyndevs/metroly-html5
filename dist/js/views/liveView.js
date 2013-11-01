/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../../assets/templates/liveBtn.html',
], function ($, _, Backbone, H, controlsTpl) {


  var LiveView = Backbone.View.extend({
    el: '#liveContainer',
    template: H.compile(controlsTpl),

    events: {
      'click #live-btn': 'toggleActive',
      'click .liveTime': 'setLiveTime'
    },

    initialize: function (options) {
      var self = this;

      this.dispatcher = options.dispatcher;
      console.log("Live view Created");
      this.model.on('change:time', this.render, this);
      this.render();

      this.dispatcher.bind("app:isHomeState", function (isHomeState) {
        if (isHomeState) {
          self.render(true);
        } else {
          self.render(false);
        } 
      });
    },

    toggleActive: function (e) {
      e.preventDefault();
      if($(".liveBubble").hasClass("shown")){
        $(".liveBubble").removeClass("shown");
      }else{
        $(".liveBubble").addClass("shown");
      }
    },

    setLiveTime: function (e) {
      console.log("here");
      e.preventDefault();
      var t = e.target.attributes["data-time"].value;
      this.model.setLiveTime(t);
      this.render();
    },

    startSpin: function () {
      $('.imgState').addClass('spin360');
    },

    stopSpin: function () {
      var targetEl = $('.imgState');
      targetEl.removeClass('spin360');
    },

    render: function (hidden) {
      var html, ctx = {};

      ctx.hidden = hidden;
      ctx.time = this.model.get('time');

      html = this.template(ctx);

      this.$el.html(html);

      return this;
    }
  });

  return LiveView;
});