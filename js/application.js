/*global define */
/*jslint nomen: true, unparam: true, indent: 2 */

define([
  'backbone',
  'views/mapView',
  'views/controlsView',
  'models/mapModel',
  'models/busModel',
  'views/geoView',
  'models/geoModel',
  'views/liveView',
  'models/liveModel',
  'views/accordionView',
  'views/favoriteView',
  'models/favoriteModel'
], function (Backbone, MapView, ControlsView, MapModel, BusModel, GeoView, GeoModel, LiveView, LiveModel, AccordionView, FavoriteView, FavoriteModel) {
  "use strict";

  console.log('inside of Application.js');
  var AppView,
    apiKey = '36ad9e86-f0b4-4831-881c-55c8d44473b3',
    mapModel, busModel, geoModel, liveModel, 
    mapView, controlsView, geoView, liveView, favView, favModel;


  AppView = Backbone.View.extend({

    initialize: function (options) {
      this.dispatcher = options.dispatcher;
      this.router = options.router;

      // Let all views have a common dispatcher they can subscribe to.
      mapModel = new MapModel({apiKey: apiKey});
      busModel = new BusModel({apiKey: apiKey});
      
      geoModel = new GeoModel();
      geoView = new GeoView({model: geoModel, dispatcher: this.dispatcher});
      liveModel = new LiveModel();
      liveView = new LiveView({model: liveModel, dispatcher: this.dispatcher});
      // Create fav view and model here
      favModel = new FavoriteModel();
      favView = new FavoriteView({model: mapModel, favModel:favModel, dispatcher: this.dispatcher});

      // A Set of models
      var mapSetModel = new Backbone.Model();
      mapSetModel.set({mapModel: mapModel, busModel: busModel});// Contains mapMode anf busModel
      controlsView = new ControlsView({model: mapSetModel, dispatcher: this.dispatcher});
      mapView = new MapView({model: mapSetModel, liveView: liveView, dispatcher: this.dispatcher, router: this.router});

      geoModel.on('change:active', this.geoLocate);
      liveModel.on('change:time', this.liveClicked);
    },

    geoLocate: function () {
      console.log("From GEO application view change active");
      mapView.removeGeoLocate();
      mapView.addGeoLocate();
    },

    liveClicked: function () {
      console.log("From LIVE application view change active");
      mapView.startBusTracking();
    },

    selectBus: function (bus) {
      this.dispatcher.trigger("app:isHomeState", false);
      console.log('App.selectBus: => BusModel.set.bus & MapModel.set.bus => ', bus);
      
      mapModel.set('bus', bus);
      busModel.set('bus', bus);
    },

    selectDirection: function (direction) {
      busModel.set('direction', direction);
    },

    toHomeState: function () {
      this.dispatcher.trigger("app:isHomeState", true);
    }

  });

  return AppView;
});