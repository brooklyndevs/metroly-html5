/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../../assets/templates/favoriteBtn.html'
], function ($, _, Backbone, H, favBtnTpl) {

  var FavoriteView = Backbone.View.extend({
    template: H.compile(favBtnTpl),

    events: {
      'click': 'favBtnClicked'
    },

    initialize: function () { },

    favBtnClicked: function (e) {
      var isActive = this.model.get('isActive');
      this.model.set('isActive', !isActive);
      this.render();
      return false;
    },

    render: function () {
      var html, ctx = {};
      ctx.isActive = this.model.get('isActive');
      html = this.template(ctx);
      this.$el.html(html);
      return this;
    }

  });

  return FavoriteView;
});