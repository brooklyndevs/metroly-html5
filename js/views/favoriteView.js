/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../../assets/templates/favoriteBtn.html',
  'appState'
], function ($, _, Backbone, H, favBtnTpl, appState) {
  var storage = appState.getBuses();

  var FavoriteView = Backbone.View.extend({
    el: "#favContainer",
    template: H.compile(favBtnTpl),

    events: {
      'click': 'favBtnClicked'
    },

    initialize: function (options) {
      var self = this;
      this.dispatcher = options.dispatcher;
      this.model.on('change:bus', this.setFavorite, this);
      this.dispatcher.bind("app:isHomeState", function (isHomeState) {
        if (!isHomeState) 
          self.render();
      });
    },

    favBtnClicked: function (e) {
      e.preventDefault();

      var active = this.options.favModel.get('active');
      this.options.favModel.set('active', !active);

      //SAVE STORAGE
      var selectedBus = this.model.get('bus');
      console.log('SelectedBus: ', selectedBus);
      var busData = storage.data[selectedBus.toLowerCase()];
      busData.favorite = !busData.favorite;
      storage.save();
      console.log('State of storage: ', storage.data);

      this.render();
    },
    setFavorite: function(){
      var currBus = this.model.get('bus');
      var bus = storage.find(currBus.toLowerCase());
      this.options.favModel.set("active", bus.favorite);
      this.render();
    },
    render: function () {
      var html, ctx = {};
      ctx.active = this.options.favModel.get('active');
      html = this.template(ctx);
      this.$el.html(html);

      return this;
    }

  });

  return FavoriteView;
});