/* One Bus Away API */

define([
  'jquery',
  'underscore',
  'storage'
], function ($, _, Storage) {
  "use strict";

  // TODO Inject API KEY, no need for hardcoding.

  var API_VERSION = 2,
      API_KEY = '36ad9e86-f0b4-4831-881c-55c8d44473b3',
      BASE_URL = 'http://bustime.mta.info/api/where/',
      END_URL = ".json?key=" + API_KEY + "&version=" + API_VERSION;

  var ajax = function (url, handleData) {
    $.ajax({
      url: url,
      timeout:10000,
      dataType: "jsonp",
      method: 'GET',
      success: function (data) {
        handleData(data);
      },
      error: function (e){
        console.log("Failed to Ajax OBA", e);
      }
    });
  };

  var sortStopsByDestination = function (data, cb) {
    var stopGroups, group0, group1, stops, routes,
      sortedStops = [], dest0 = [], dest1 = [];

    stopGroups = data.entry.stopGroupings[0].stopGroups;

    _.each(stopGroups, function (stopGroup) {
      if (stopGroup.id == '0') {
        group0 = stopGroup;
      } else if (stopGroup.id == '1') {
        group1 = stopGroup;
      }
    });

    stops = data.references.stops;
    routes = data.references.routes;

    _.each(stops, function (stop) {
      var stopId = stop.id;

      // Add an array of routes that serve this stop.
      stop.routes = [];
      _.each(stop.routeIds, function (routeId) {
        _.each(routes, function (route) {
          if (route.id == routeId) {
            stop.routes.push(route);
          }
        });
      });

      if (_.contains(group0.stopIds, stopId)) {
        dest0.push(stop);
      } else if (_.contains(group1.stopIds, stopId)) {
        dest1.push(stop);
      }
    });

    sortedStops.push(dest0);
    sortedStops.push(dest1);

    cb(sortedStops);
  };

  /*
   * Our public OneBusAway API
   */
  var Oba = function (apiKey) {
    API_KEY = apiKey;
  };

  Oba.getBusStops = function (busName, cb) {
    var s = Storage.get('buses'),
      routeID = s.find(busName.toLowerCase()).id,
      query = "stops-for-route/" + routeID,
      url = BASE_URL + query + END_URL + "&includePolylines=false";

    ajax(url, function (result) {
      sortStopsByDestination(result.data, cb);
    });
  };

  return Oba;
});