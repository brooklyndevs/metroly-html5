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
  'models/liveModel'
], function (Backbone, MapView, ControlsView, MapModel, GeoView, GeoModel, LiveView, LiveModel) {
  "use strict";

  var AppView,
    apiKey = '36ad9e86-f0b4-4831-881c-55c8d44473b3',
    mapModel = new MapModel({apiKey: apiKey}),
    controlsView = new ControlsView({model: mapModel}),
    mapView = new MapView({model: mapModel}),    
    geoModel = new GeoModel(),
    geoView = new GeoView({model: geoModel}),
    liveModel = new LiveModel(),
    liveView = new LiveView({model: liveModel});


  AppView = Backbone.View.extend({

    initialize: function () {
      geoModel.on('change:active', this.geoLocate);
    },
    geoLocate: function (){
      console.log("From application view change active");
      if(geoModel.get("active")){
        mapView.addGeoLocate();
        // if (!this.poll) {
        //   this.poll = new ShortPoll(5000);
        // }
        // this.poll.start(function(){
        //   mapView.addGeoLocate();
        //   mapView.removeGeoLocate();
        // });
      }else{
        //this.poll.stop();
        mapView.removeGeoLocate();
      }
      
    },
    selectBus: function (bus) {
      mapModel.set('bus', bus);
    },

    selectDirection: function (direction) {
      mapModel.set('direction', direction);
    },

    toHomeState: function () {

    }
  });

  return AppView;
});