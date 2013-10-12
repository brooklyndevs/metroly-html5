/*
 * Buses NYC - A wrapper for the MTA BusTime API
 * http://github.com/eddflrs/buses-nyc
 * @author Eddie Flores
 * @license MIT License
 */

/*global jQuery */

(function (root, $) {
  "use strict";

  var MtaBusTime, config, url, searchUrl, monitoringUrl;

  url = "http://bustime.mta.info/api/siri/";
  searchUrl = "http://bustime.mta.info/api/search";

  config = {
    key: "",
    url: url,
    searchUrl: searchUrl,
    monitoringUrl: url + "vehicle-monitoring.json",
    opRef: "MTA NYCT"
  };

  /*
   * @public
   * @constructor
   */
  MtaBusTime = function (apiKey) {
    if (!apiKey) {
      throw new Error("API key must be passed as argument");
    }
    config.key = apiKey;
  };

  /*
   * @public
   * Returns the buses for the requested busline.
   */
  MtaBusTime.prototype.getBuses = function (bus, direction, cb) {

    var data = {
      key: config.key,
      LineRef: bus.toUpperCase(),
      OperatorRef: config.opRef
    };

    if (direction || direction === 0) {
      data.DirectionRef = direction;
    }

    var busPromise = $.ajax({
      type: 'GET',
      url: config.monitoringUrl,
      data: data,
      dataType: "jsonp"
    });

    busPromise.done(function (data) {
      var monitored = data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0],
        vehicles = monitored.VehicleActivity;
      cb(vehicles);
    });

    busPromise.fail(function (error) {
      throw new Error('Failed to retrieve buses.');
    });
  };

  /*
   * @public
   * Returns the bus route information.
   */
  MtaBusTime.prototype.getRoute = function (bus, cb) {
    var data = {
      "q": bus
    };

    var routePromise = $.ajax({
      type: 'GET',
      url: config.searchUrl,
      data: data,
      dataType: 'jsonp'
    });

    routePromise.done(function (data) {
      var route = data.searchResults.matches[0];
      cb(route);
    });

    routePromise.fail(function () {
      throw new Error('Failed to retrieve the route.');
    });
  };
  root.MtaBusTime = MtaBusTime;
}(this, jQuery));