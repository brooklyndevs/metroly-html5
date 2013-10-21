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

    initialize: function () {
      console.log("Live view Created");
      this.model.on('change:time', this.render, this);
      this.render();
    },

    toggleActive: function (e) {
      e.preventDefault();
      // this.model.toggleActive();
      $("#live-btn").addClass("disabled");
      $( ".liveBubble" ).slideToggle("slow", function(){
          $("#live-btn").removeClass("disabled");
      });
    },

    setLiveTime: function (e) {
      e.preventDefault();
      var t = e.target.attributes["data-time"].value;
      this.model.setLiveTime(t);
    },

    render: function () {
      var html, ctx = {};

      ctx.time = this.model.get('time');
      
      html = this.template(ctx);

      this.$el.html(html);

      return this;
    }
  });

  return LiveView;
});