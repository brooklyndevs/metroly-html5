/*jslint nomen: true, unparam: true, indent: 2, browser: true, bitwise: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'leaflet',
  'shortpoll',
  'appState',
  'markerCluster'
], function ($, _, Backbone, L, ShortPoll, appState, markerCluster) {
  "use strict";

  var RouteLayers = {
    dir0: new L.LayerGroup(),
    dir1: new L.LayerGroup()
  };

  var CurrentRouteLayer = {};
  var CurrentBusLayer   = {};
  var CurrentStopsLayer = {};

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
    NEBound: [41.010000, -73.712769]
    // NEBound: [40.908739, -73.712769]

  };

  var defaultLocation = locations.brooklyn;
  var defaultZoomLevel = 13;

  var tilesUrl = 'http://{s}.tile.cloudmade.com/23b30a5239c3475d9babd947f2b7a12b/22677/256/{z}/{x}/{y}.png';

  var LocatorIcon = L.Icon.extend({
    options: {
      iconUrl: 'assets/images/icon_set/locator_icon.svg',
      shadowUrl: 'assets/images/icon_set/locator_icon_shadow.png',
      iconSize: [26, 40],
      shadowSize: [13, 29],
      iconAnchor: [13, 40],
      shadowAnchor: [-1, 29],
      popupAnchor: [1, -40]
    }
  });

  var imagesBasePath = 'assets/images/icon_set/';
  var locators = {
    n: new LocatorIcon({iconUrl: imagesBasePath + 'icon_n.svg'}),
    ne: new LocatorIcon({iconUrl: imagesBasePath + 'icon_ne.svg'}),
    nw: new LocatorIcon({iconUrl: imagesBasePath + 'icon_nw.svg'}),
    w: new LocatorIcon({iconUrl: imagesBasePath + 'icon_w.svg'}),
    e: new LocatorIcon({iconUrl: imagesBasePath + 'icon_e.svg'}),
    se: new LocatorIcon({iconUrl: imagesBasePath + 'icon_se.svg'}),
    s: new LocatorIcon({iconUrl: imagesBasePath + 'icon_s.svg'}),
    sw: new LocatorIcon({iconUrl: imagesBasePath + 'icon_sw.svg'}),
  };

  var cloudmadeTiles = new L.TileLayer(tilesUrl, {
    // maxZoom: 16,
    // minZoom: 11
  });

  var maxBounds = new L.LatLngBounds(locations.SWBound, locations.NEBound);

  var createLocatorIcon = function (bearing) {
    var locator_icon;

    if (bearing >= 67.5 && bearing < 112.5) {
      locator_icon = locators.n;
    } else if (bearing >= 112.5 && bearing < 157.5) {
      locator_icon = locators.nw;
    } else if (bearing >= 157.5 && bearing < 202.5) {
      locator_icon = locators.w;
    } else if (bearing >= 202.5 && bearing < 247.5) {
      locator_icon = locators.sw;
    } else if (bearing >= 247.5 && bearing < 292.5) {
      locator_icon = locators.s;
    } else if (bearing >= 292.5 && bearing < 337.5) {
      locator_icon = locators.se;
    } else if (bearing >= 337.5 || bearing < 22.5) {
      locator_icon = locators.e;
    } else if (bearing >= 22.5 && bearing < 67.5) {
      locator_icon = locators.ne;
    } else {
      locator_icon = locators.n;
    }

    return locator_icon;
  };

  var MapView = Backbone.View.extend({
    el: '#map',

    initialize: function (options) {

      var self = this;

      this.dispatcher = options.dispatcher;
      this.initMap();
      $(window).bind("resize", _.bind(this.ensureMapHeight, this));
      this.model.on('change:route', this.cacheRoute, this);
      this.model.on('change:direction', this.changeDirection, this);
      this.model.on('getBuses', this.options.liveView.startSpin, this);
      this.model.on('gotBuses', this.showBuses, this);
      this.model.on('gotStops', this.markStops, this);
      this.initGeoLocate();

      this.dispatcher.bind("app:isHomeState", function (isHomeState) {
        if (isHomeState) {
          self.model.resetBus();
          self.showHomeScreen(true);
        } else {
          self.showHomeScreen(false);
        }
      });

    },

    initMap: function () {
      this.ensureMapHeight();
      this.map = L.map(this.el);
      this.map.setView(defaultLocation, defaultZoomLevel);
      this.ensureMapHeight();
      cloudmadeTiles.addTo(this.map);
      this.map.setMaxBounds(maxBounds);
    },

    initGeoLocate: function () {

      var self = this;

      this.map.on("locationerror", function() {
        console.log("Location error");
        $("#geo-btn").removeClass("spin360");
        $("#geo-btn").removeClass("geo-active");
        $("#geo-btn").removeClass("disabled");
      });

      this.map.on("locationfound", function(locData) {

        var currentMapZoom = self.map.getZoom(),
            currentMapBounds = self.map.getBounds();


        //IF Not Useful, just comment out Else Block
        // and leave If condition's code
        if (currentMapBounds.contains(locData.latlng)) {

          panToAndRestoreSpinner(locData.latlng);

        } else {

          self.map.on("zoomend", function zoomOnLcationFound (e) {

            self.map.off("zoomend", zoomOnLcationFound);

            setTimeout(function () {

              panToAndRestoreSpinner(locData.latlng, function () {

                self.map.setZoom(currentMapZoom, {
                  animate: true
                });
              });

            }, 800);

          });

          self.map.setZoom(11, {animate: true});
        }

        function panToAndRestoreSpinner(LatLng, callback) {

          self.map.panTo(locData.latlng, {
            duration: 0.80,
            animate: true
          });

          // var myIcon = L.divIcon({className: 'leaflet-div-icon'});
          self.geoCircle1 = L.circle(locData.latlng, 10, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.8
          }).addTo(self.map);

          self.geoCircle2  = L.circle(locData.latlng, 400, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.1
          }).addTo(self.map);

          $("#geo-btn").removeClass("disabled");

          function restoreSpinnerAndCallback() {

            $("#geo-btn").removeClass("geo-active");
            $("#geo-btn").removeClass("spin360");

            if (callback) callback();

            var popup = L.popup({
              closeButton: false,
              offset: new L.Point(0, -25)
            })
            .setLatLng(locData.latlng)
            .setContent('<p>You are here!</p>')
            .openOn(self.map);

            console.log(popup);

          }

          setTimeout(restoreSpinnerAndCallback, 800);

        }

      });
    },

    addGeoLocate: function () {
      console.log("Add Geo");
      $("#geo-btn").addClass("disabled");
      $("#geo-btn").addClass("geo-active");
      $("#geo-btn").removeClass("spin360");
      $("#geo-btn").addClass("spin360");

      this.map.closePopup();

      this.map.locate({
        setView: false, //don't automatically go to coordinates
        //maxZoom: 15,
        watch: false
      });

    },

    removeGeoLocate: function () {
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
      if (this.poll) this.poll.stop();
    },

    changeDirection: function () {
      var direction = this.model.get('direction');
      this.model.getBuses();
      this.map.removeLayer(CurrentRouteLayer);
      CurrentRouteLayer = RouteLayers['dir' + direction];
      this.map.addLayer(CurrentRouteLayer);
    },

    showHomeScreen: function (isHomeState) {
      console.log("SHOW MAP HOME STATE");
      if (isHomeState) {
        this.map.removeLayer(CurrentBusLayer);
        this.map.removeLayer(CurrentRouteLayer);
        $("#homeScreen").addClass("visible");
      } else {
        $("#homeScreen").removeClass("visible");
      }
    },

    showBuses: function (buses) {
      var self = this, i, bus, lat, lng, locatorIcon, marker, markerInfo, bearing, layer, busesLength = 0;

      if (buses) {
        busesLength = buses.length;
      }

      this.map.removeLayer(CurrentBusLayer);
      CurrentBusLayer = new L.LayerGroup();

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
        CurrentBusLayer.addLayer(marker);
        CurrentBusLayer.addTo(this.map);
      }

      setTimeout(function () {
        self.options.liveView.stopSpin();
      }, 1000);

      this.startBusTracking();
    },

    markStops: function (stops) {
      var self = this,
        stopCircle = {
          stroke: false,
          fillColor: 'pink',
          fillOpacity: 1.0,
          weight: 1,
          radius: 10
        };

      self.map.removeLayer(CurrentStopsLayer);

      CurrentStopsLayer = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        // spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        // disableClusteringAtZoom: 10,
        maxClusterRadius: 50, // default is 80
      });

      _.each(stops, function (stop) {

        console.log(stop);

        var latlng = new L.LatLng(stop.lat, stop.lon),
          circle = L.circleMarker(latlng, stopCircle);
        circle.bindPopup("<small>" + stop.name + "</small>");
        circle.addTo(CurrentStopsLayer);
      });

      CurrentStopsLayer.addTo(self.map);
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