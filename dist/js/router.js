/*global define */

define(['jquery', 'backbone', 'domReady', 'appState'], function ($, Backbone, domReady, appState) {
  "use strict";

  var Router, 
      self = this,
      dispatcher = _.clone(Backbone.Events);

  var RECENT_BUSES_MAX = 5;
  var RECENTLY_VIEWED_BUSES = 'recently_viewed_buses';

  Router = Backbone.Router.extend({
    routes: {
      '': 'homeState',
      'buses/:bus': 'selectBus',
      'bus/:bus/:dir': 'selectDirection',
      '*default': 'default'
    }
  });

  Router.initialize = function () {

    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };

    var router = new Router();

    appState.init(function () {

      console.log('Storage settings: ', appState.getSettings());
      console.log('Storage buses: ', appState.getBuses());

      console.log('Before requiring APP');

      // Listener on the sidebar to close
      $(document).on("click", ".page", function(){
        var pg = document.querySelector('.page');
        var menuBtn = document.querySelector('#menu-btn');
        if(pg.style.marginLeft === "200px"){
          pg.style.marginLeft = "";
          menuBtn.style.backgroundPosition = "0 0px";
        }
      });
      $(document).on("click", "#map, #header-wrapper", function(){
        if($(".liveBubble").hasClass("shown")){
          $(".liveBubble").removeClass("shown");
        }
      });

      require(['application'], function (App) {

        console.log('App required');
        
        var dispatcher = _.clone(Backbone.Events);
        var app = new App(dispatcher);

        router.on('route:homeState', function () {

          console.log('___ ___In Home State___ ___');

          app.toHomeState();
          //app.selectBus('b63');
        });

        router.on('route:selectBus', function (bus) {

          console.log("ROUTER: SELECT BUS: ", bus);

          var settings = appState.getSettings();
          var recentBuses = settings.find(RECENTLY_VIEWED_BUSES);
          if (!recentBuses) {
            recentBuses = [];
          }

          var idxBus = recentBuses.indexOf(bus);

          if (idxBus > -1) {
            recentBuses.remove(idxBus);
          }

          recentBuses.unshift(bus);

          if (recentBuses.length > RECENT_BUSES_MAX) {
            recentBuses.pop();
          }

          settings.insert(RECENTLY_VIEWED_BUSES, recentBuses);
          settings.save();
          console.log("app.selectBus: ", bus);
          app.selectBus(bus);
        });

        Backbone.history.start({pushState: false});
      });
      console.log('After requiring APP');
    });
  };

  return Router;
});




