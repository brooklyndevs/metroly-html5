/* One Bus Away API */

define([
	'jquery',
	'underscore'
], function ($, _) {
	"use strict";

	// TODO Inject this API KEY, no need for hardcoding.
	var API_KEY = '36ad9e86-f0b4-4831-881c-55c8d44473b3',
		BASE_URL = 'http://bustime.mta.info/api/where/',
		END_URL = ".json?key=" + API_KEY;

	var ajax = function (url, handleData) {
		$.ajax({
			url: url,
			dataType: "jsonp",
			method: 'GET',
			success: function (data) {
				handleData(data);
			},
			fail: function (e){
				console.log("Failed to Ajax OBA", e);
			}
		});
	};

	var Oba = {

		getBusStops: function (routeId, cb) {
			var query = "stops-for-route/MTA NYCT_" + routeId.toUpperCase(),
				url = BASE_URL + query + END_URL;

			ajax(url, function (data) {
				cb(data.data.stops);
			});
		}

		// TODO Wrap more OBA methods.
	};

	return Oba;
});