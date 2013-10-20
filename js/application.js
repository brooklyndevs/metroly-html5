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
      liveModel.on('change:active', this.liveClicked);
    },
    geoLocate: function (){
      console.log("From GEO application view change active");
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
    liveClicked: function (){
      console.log("From LIVE application view change active");

      if(!liveModel.get("active")){
        var t = parseInt(liveModel.get("time"));
        console.log(t);
        if(t > 0){
          mapView.startBusTracking(t);
        }else{
          mapView.poll.stop();
        }
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