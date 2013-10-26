/*jslint nomen: true, unparam: true, indent: 2, browser: true, bitwise: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'leaflet',
  'shortpoll',
  'appState'
], function ($, _, Backbone, L, ShortPoll, appState) {
  "use strict";

  var RouteLayers = {
    dir0: new L.LayerGroup(),
    dir1: new L.LayerGroup()
  };

  var CurrentRouteLayer = {};

  var decodePolyline = function (encoded) {
    var len = encoded.length;
    var index = 0;
    var array = [];
    var lat = 0;
    var lng = 0;

    while (index < len) {
      var b;
      var shift = 0;
      var result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      array.push([lat * 1e-5, lng * 1e-5]);
    }
    return array;
  };

  var locations = {
    bronx:        [40.832359, -73.892670],
    brooklyn:     [40.650000, -73.950000],
    manhattan:    [40.764785, -73.975067],
    statenIsland: [40.581315, -74.154968],
    queens:       [40.755424, -73.876877],

    /* Maximum map bounds for nyc */
    SWBound: [40.477666, -74.308777],
    NEBound: [40.998739, -73.712769]
    // NEBound: [40.908739, -73.712769]

  };

  var defaultLocation = locations.brooklyn;
  var defaultZoomLevel = 13;

  var tilesUrl = 'http://{s}.tile.cloudmade.com/23b30a5239c3475d9babd947f2b7a12b/22677/256/{z}/{x}/{y}.png';

  var circleOptions = {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.7
  };

  var LocatorIcon = L.Icon.extend({
    options: {
      iconUrl: 'assets/images/icon_set/locator_icon.png',
      shadowUrl: 'assets/images/icon_set/locator_icon_shadow.png',
      iconSize: [26, 40],
      shadowSize: [13, 29],
      iconAnchor: [13, 40],
      shadowAnchor: [-1, 29],
      popupAnchor: [1, -40]
    }
  });

  var cloudmadeTiles = new L.TileLayer(tilesUrl, {
    maxZoom: 16,
    minZoom: 11
  });

  var maxBounds = new L.LatLngBounds(locations.SWBound, locations.NEBound);

  var createLocatorIcon = function (bearing) {
    var locator_icon = new LocatorIcon(),
      iconUrl = '',
      imagesBasePath = 'assets/images/icon_set/';

    if (bearing >= 67.5 && bearing < 112.5) {
      iconUrl = imagesBasePath + 'icon_n.png';
    } else if (bearing >= 112.5 && bearing < 157.5) {
      iconUrl = imagesBasePath + 'icon_nw.png';
    } else if (bearing >= 157.5 && bearing < 202.5) {
      iconUrl = imagesBasePath + 'icon_w.png';
    } else if (bearing >= 202.5 && bearing < 247.5) {
      iconUrl = imagesBasePath + 'icon_sw.png';
    } else if (bearing >= 247.5 && bearing < 292.5) {
      iconUrl = imagesBasePath + 'icon_s.png';
    } else if (bearing >= 292.5 && bearing < 337.5) {
      iconUrl = imagesBasePath + 'icon_se.png';
    } else if (bearing >= 337.5 || bearing < 22.5) {
      iconUrl = imagesBasePath + 'icon_e.png';
    } else if (bearing >= 22.5 && bearing < 67.5) {
      iconUrl = imagesBasePath + 'icon_ne.png';
    }

    if (iconUrl !== '') {
      locator_icon = new LocatorIcon({iconUrl: iconUrl});
    }

    return locator_icon;
  };

  var MapView = Backbone.View.extend({
    el: '#map',

    initialize: function () {
      this.initMap();
      $(window).bind("resize", _.bind(this.ensureMapHeight, this));
      this.model.on('change:route', this.cacheRoute, this);
      this.model.on('change:direction', this.changeDirection, this);
      this.model.on('getBuses', this.options.liveView.startSpin, this);
      this.model.on('gotBuses', this.showBuses, this);
      this.initGeoLocate();
    },

    initMap: function () {
      this.ensureMapHeight();
      this.map = L.map(this.el);
      this.map.setView(defaultLocation, defaultZoomLevel);
      this.ensureMapHeight();
      cloudmadeTiles.addTo(this.map);
      this.map.setMaxBounds(maxBounds);
    },

    initGeoLocate: function (){
      var self = this;
      this.map.on("locationerror", function() {
        console.log("Location error");
        $("#geo-btn").removeClass("spin360");
        $("#geo-btn").removeClass("geo-active");
        $("#geo-btn").removeClass("disabled");
        // L.circle(locations.brooklyn, 100, circleOptions).addTo(this.map);
      });

      this.map.on("locationfound", function(locData) {
        console.log("Location found");

        var lat = locData.latlng.lat;
        var lng = locData.latlng.lng;
        // var myIcon = L.divIcon({className: 'leaflet-div-icon'});
        // L.marker([lat, lng], {icon: myIcon}).bindPopup("You are here!").addTo(self.map);
        self.geoCircle1 = L.circle([lat, lng], 10, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.8
        }).addTo(self.map);

        self.geoCircle2  = L.circle([lat, lng], 400, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.1
        }).addTo(self.map);

        $("#geo-btn").removeClass("disabled");
        setTimeout(function(){
          $("#geo-btn").removeClass("geo-active");
          $("#geo-btn").removeClass("spin360");
        }, 1000);
        // $("#geo-btn").removeClass("geo-active");

      });
    },

    addGeoLocate: function (){
      console.log("Add Geo");
      $("#geo-btn").addClass("disabled");
      $("#geo-btn").addClass("geo-active");
      $("#geo-btn").removeClass("spin360");
      $("#geo-btn").addClass("spin360");

      this.map.locate({
        setView: true,
        maxZoom: 15,
        watch: false
      });
    },

    removeGeoLocate: function (){
      console.log("Remove Geo");
      if(this.geoCircle1 && this.geoCircle1){
        this.map.removeLayer(this.geoCircle1);
        this.map.removeLayer(this.geoCircle2);
      }
    },

    ensureMapHeight: function () {
      var newHeight = $(window).height();
      $("#map").css("height", newHeight);
    },

    selectBus: function (bus) {
      this.model.set('bus', bus);
    },

    startBusTracking: function () {
      var self = this;
      var settings = appState.getSettings();
      var time = parseInt(settings.find('check_interval')) || false;
      if (!time) {
        console.log('Will stop bus tracking');
        return this.stopBusTracking();
      }
      if (!this.poll) {
        this.poll = new ShortPoll(time * 1000);
      }

      var getBuses = function () {
        self.model.getBuses();
      };
      this.poll.start(getBuses);
    },

    stopBusTracking: function () {
      this.poll && this.poll.stop();
    },

    changeDirection: function () {
      var direction = this.model.get('direction');
      this.model.getBuses();
      this.map.removeLayer(CurrentRouteLayer);
      CurrentRouteLayer = RouteLayers['dir' + direction];
      this.map.addLayer(CurrentRouteLayer);
    },

    busLayer: new L.LayerGroup(),

    showBuses: function (buses) {
      var self = this, i, bus, lat, lng, locatorIcon, marker, markerInfo, bearing, layer, busesLength = 0;

      if (buses) {
        busesLength = buses.length;
      }

      this.map.removeLayer(this.busLayer);
      this.busLayer = new L.LayerGroup();

      for (i = 0; i < busesLength; i += 1) {
        bus = buses[i].MonitoredVehicleJourney;
        lat = bus.VehicleLocation.Latitude;
        lng = bus.VehicleLocation.Longitude;
        bearing = bus.Bearing;
        locatorIcon = createLocatorIcon(bearing);
        marker = L.marker([lat, lng], {icon: locatorIcon});
        // TODO FUTURE Swap this out for a handlebars template.
        markerInfo = "<p><strong>" + bus.PublishedLineName + "</strong> &rarr; " + bus.DestinationName + "</p>";
        marker.bindPopup(markerInfo);
        this.busLayer.addLayer(marker);
        self.busLayer.addTo(this.map);
      }

      setTimeout(function () {
        self.options.liveView.stopSpin();
      }, 1000);

      this.startBusTracking();
    },

    cacheRoute: function () {
      var self = this,
        route = this.model.get('route'),
        directions = route.directions;

      RouteLayers.dir0 = new L.LayerGroup();
      RouteLayers.dir1 = new L.LayerGroup();

      _.each(directions, function (direction) {
        _.each(direction.polylines, function (polyline) {
          var polyLatLngs = [], dirId = direction.directionId, leafletPoly,
            decodedPoints = decodePolyline(polyline);
          _.each(decodedPoints, function (point) {
            polyLatLngs.push(new L.LatLng(point[0], point[1]));
          });

          leafletPoly = new L.Polyline(polyLatLngs, {color: '#' + route.color});

          RouteLayers['dir' + dirId].addLayer(leafletPoly);

          // Show dir 0 by default.
          self.map.removeLayer(CurrentRouteLayer);
          CurrentRouteLayer = RouteLayers.dir0;
          self.map.addLayer(CurrentRouteLayer);

          if (decodedPoints.length > 0) {
            var midIndex = Math.floor(decodedPoints.length / 2);
            var midPoint = decodedPoints[midIndex];
            var midLatLng = new L.LatLng(midPoint[0], midPoint[1]);
            self.map.panTo(midLatLng);
          }
        });
      });
    },

    render: function () {
      return this;
    }
  });

  return MapView;
});