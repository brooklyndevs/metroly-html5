/* One Bus Away API */

define([
	'jquery',
	'underscore'
], function ($, _) {
	"use strict";

	var Oba = {

		apiKey:'36ad9e86-f0b4-4831-881c-55c8d44473b3',
		baseUrl:'http://bustime.mta.info/api/where/',

		// Init Oba if anything
		init: function (){
			console.log("Init OBA API");
		},

		// Get Bus stops 
		getBusStops: function (routeID, cb) {
			var r = routeID.toUpperCase();
			console.log("Getting Bus Stops for: " + r);
			// Right API CALL URL
			this.ajax(this.baseUrl+"stops-for-route/MTA NYCT_"+r+".json?key="+this.apiKey, cb);
		},

		// Get Bus Routes
		getBusRoutes: function (routeID) {
			console.log("Getting Bus Routes for: " + routeID);
		},

		// Ajax GET request
		ajax: function (url, handleData){
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

		}
	};


	return Oba;
});