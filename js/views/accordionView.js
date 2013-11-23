/*jslint nomen: true, unparam: true, indent: 4, quotmark:false */
/* global define */

define(['underscore', 'domReady', 'accordion', 'appState'], function (_, domReady, Accordion, appState) {

    'use strict';

    var settingsObj = appState.getSettings(),
      busesObj = appState.getBuses(),
      buses = [];

    _.each(busesObj.data, function (val) {
        buses.push(val);
    });

    buses = _.sortBy(buses, function (bus) {
        return bus.name;
    });

    var enforceHeight = function (element) {
        var enforceElement = document.querySelector(element);
        return function () {
            var windowHeight = window.innerHeight + 'px';
            enforceElement.style.height = windowHeight;
            enforceElement.style.maxHeight = windowHeight;
        };
    },
    
    /*
     * Add list item attributes to list item
     */
    addListItemAttributes = function (item) {
        // clears color issues if present
        //var color = "#" + ("000000" + item.color).replace("#","").split("").slice(-6).join("");
        return {
            "style": 'border-left-color:' + item.color,
            "data-href": '#buses/' + item.name
        };
    },
    addEmptyListItemAttributes = function () {
        return {
            "class": "list-link-empty"
        };
    },

    busNamesToRecentBusObjects = function (busNames) {
        var busesArr = [],
            busObj;
        _.each(busNames, function (recentBus) {
            busObj = busesObj.data[recentBus.toLowerCase()];
            busesArr.push({name: recentBus, recent: true, color: (busObj ? busObj.color : "000000") });
        });
        return busesArr;
    },

    /* Close Side Nav when clicking on list links */
    closeSideNavForListElements = function (params) {
        Array.prototype.slice.call(
            document.querySelectorAll("#" + params.getId(params.group_item_class) + " ." + params.search_group_item_single_class), 0
            ).forEach(function(i) {

            i.addEventListener('click', function (e) {
                var elementClicked = e.target,
                    listItemHref = elementClicked.getAttribute("data-href");
                if (listItemHref) {
                    // switch route if element is a route
                    window.location.href = listItemHref;
                }
                if (!(elementClicked.className && elementClicked.className.match('list-link-empty'))) {
                    // if not an empty link, close the side-nav
                    document.querySelector('#menu-btn').click();
                }
                e.stopPropagation();
                return false;
            });
        });
    };


    domReady(function () {

      /*
       * Change Side Navigation height to window
       * to make elements inside to cause overflow-y
       */
        var enforceSideNavHeight = enforceHeight('.side-nav');
        enforceSideNavHeight();
        window.addEventListener("resize", enforceSideNavHeight);

        
        /* Side Navigation Accordion */
        var accordion = new Accordion({
            // 1. Set Accordion Settings.
            // Most important is the accordion id. Rest are optional, but are the CSS classes that Serges provided.
            accordion_id: "accordion"
        }).
        // Adds a "SearchGroup"
        addSearchGroup({
            name: "Search",
            data: buses,
            //itemText: generateLink,
            listItemProperties: addListItemAttributes,
            maxDisplay: 6,
            afterRender: closeSideNavForListElements
        }).
        // Adds a "Group"
        addGroup({
            name: "Recent",
            data: busNamesToRecentBusObjects(settingsObj.find('recently_viewed_buses')),
            // Pick items that have recent property
            callback: function (e) { return e.recent; },
            //itemText: generateLink,
            listItemProperties: addListItemAttributes,
            afterRender: closeSideNavForListElements
        }).
        // Adds a "Group"
        addGroup({
            name: "Favorites",
            data: buses,
            // Pick items that have favorite property
            callback: function (e) { return e.favorite; },
            //itemText: generateLink,
            listItemProperties: addListItemAttributes,
            afterRender: closeSideNavForListElements
        }).
        // Adds a "Group"
        addGroup({
            name: "All",
            data: buses,
            //itemText: generateLink,
            listItemProperties: addListItemAttributes,
            // Picks all items. By default callback is:
            // callback: function (e) { return e; }
            afterRender: closeSideNavForListElements
        }).
        // Draw both "Group"s and "SearchGroup"s
        render().
        // Add event listeners to Groups
        addListeners();


        /*
         * Functional helper - builds a callback function based on a
         * condition being satisfied and callbacks called in return
         */
        function conditionalCallback(conditional) {
            return function (condition, trueCallback, falseCallback, finallyCallback) {
                var result;
                if (conditional(condition)) {
                    result = trueCallback(condition);
                } else {
                    result = falseCallback(condition);
                }
                if (!finallyCallback) return result;
                return finallyCallback(condition, result);
            };
        }

        var ifArrayEmpty  = conditionalCallback(function (data) { return data.length === 0; }),
          isSameGroupData = conditionalCallback(function (data) { return data[0].isSameData(data[1]); });

        var onRecentBusStorageChanged = function (changeInfo) {
            var busNames = changeInfo.data.recently_viewed_buses,
                recentBusObjects = busNamesToRecentBusObjects(busNames);

            ifArrayEmpty(recentBusObjects,
                function EmptyRecent() {
                    accordion.groups.Recent.changeDataAndRender({
                        listItemProperties: addEmptyListItemAttributes,
                        data: [{name: "No recent buses", recent: true}]
                    });
                },
                function NotEmptyRecent(data) {
                    accordion.groups.Recent.changeDataAndRender({
                        listItemProperties: addListItemAttributes,
                        data: data
                    });
                }
            );
        },
        onFavoriteBusStorageChanged = function (changeInfo) {

            if (changeInfo && changeInfo.saved) {
                var favBuses = _.filter(busesObj.data, function (bus) {
                    return bus.favorite;
                });

                isSameGroupData([accordion.groups.Favorites, favBuses],
                    undefined,
                    function DifferentFavorites() {
                      
                        ifArrayEmpty(favBuses,
                            function EmptyFavorites() {
                                accordion.groups.Favorites.changeDataAndRender({
                                    listItemProperties: addEmptyListItemAttributes,
                                    data: [{name: "No favorite buses", favorite: true }]
                                });
                            },
                            function NotEmptyFavorites(data) {
                                accordion.groups.Favorites.changeDataAndRender({
                                    listItemProperties: addListItemAttributes,
                                    data: data
                                });
                            }
                        );
                    }
                );

            }
        };

        // Listens on all events.
        busesObj.on('*', onFavoriteBusStorageChanged);
        settingsObj.on('recently_viewed_buses', onRecentBusStorageChanged);

        busesObj.trigger("*", {saved: true});
        // settingsObj.trigger("recently_viewed_buses");
        settingsObj.insert("recently_viewed_buses", []);
    });
});