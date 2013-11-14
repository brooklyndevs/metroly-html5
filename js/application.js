/*global define */
/*jslint nomen: true, unparam: true, indent: 2 */

define([
  'backbone',
  'views/mapView',
  'views/controlsView',
  'models/mapModel',
  'views/geoView',
  'models/geoModel',
  'views/liveView',
  'models/liveModel',
  'views/accordionView'
], function (Backbone, MapView, ControlsView, MapModel, GeoView, GeoModel, LiveView, LiveModel, AccordionView) {
  "use strict";

  console.log('inside of Application.js');
  var AppView,
    apiKey = '36ad9e86-f0b4-4831-881c-55c8d44473b3',
    mapModel, geoModel, liveModel, 
    mapView, controlsView, geoView, liveView;


  AppView = Backbone.View.extend({

    initialize: function (options) {
      this.dispatcher = options;

      // Let all views have a common dispatcher they can subscribe to.
      mapModel = new MapModel({apiKey: apiKey});
      controlsView = new ControlsView({model: mapModel, dispatcher: this.dispatcher});
      geoModel = new GeoModel();
      geoView = new GeoView({model: geoModel, dispatcher: this.dispatcher});
      liveModel = new LiveModel();
      liveView = new LiveView({model: liveModel, dispatcher: this.dispatcher});
      mapView = new MapView({model: mapModel, liveView: liveView, dispatcher: this.dispatcher});

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
      console.log('App.selectBus -> MapModel.set.bus = ', bus);
      mapModel.set('bus', bus);
    },

    selectDirection: function (direction) {
      mapModel.set('direction', direction);
    },

    toHomeState: function () {
      this.dispatcher.trigger("app:isHomeState", true);
    }

  });

  return AppView;
});