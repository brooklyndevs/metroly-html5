define(['underscore', 'domReady', 'accordion', 'appState'], function (_, domReady, Accordion, appState) {

    var settingsObj = appState.getSettings(),
      busesObj = appState.getBuses(),
      buses = [];

    _.each(busesObj.data, function (val, key) {
      buses.push(val);
    });

    buses = _.sortBy(buses, function (bus) {
      return bus.name;
    });

    var enforceHeight = function (element) {
        var enforceElement = document.querySelector(element);
        return function () {
          var windowHeight = window.innerHeight + "px";
          enforceElement.style.height = windowHeight;
          enforceElement.style.maxHeight = windowHeight;
        };
    },
    /*
     * A list item text callback.
     * Display bus link for each item.
     */
    generateLink = function (item) {
      // Assuming HTML5 PushState would work.
      return "<a href='#" + "buses/" + item.name + "' class='list-link'>" + item.name + "</a>";
    },
    generateEmptyLink = function (item) {
      return "<a class='list-link list-link-empty'>" + item.name + "</a>";
    },
    /*
     * Display color as style property for list item
     */
    addListColors = function (item) {
      return { style: "border-left-color:" + item.color };
    },

    busNamesToRecentBusObjects = function (busNames) {
      var busesArr = [];
      _.each(busNames, function (recentBus) {
        busesArr.push({name: recentBus, recent: true, color: busesObj.data[recentBus.toLowerCase()].color });
      });
      return busesArr;
    },



    /* Close Side Nav when clicking on links */
    closeSideNavForElement = function (element) {
      element.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!(e.currentTarget.className && e.currentTarget.className.match('list-link-empty'))) {
          document.querySelector('#menu-btn').click();
        }
        return false;
      });
    };


    domReady(function () {

      /*
       * Change Side Navigation height to window
       * to make elements inside to cause overflow-y
       */
      var enforceSideNavHeight = enforceHeight(".side-nav");
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
          itemText: generateLink,
          listItemProperties: addListColors,
          maxDisplay: 6
        }).
        // Adds a "Group"
        addGroup({
          name: "Recent",
          data: busNamesToRecentBusObjects(settingsObj.find('recently_viewed_buses')),
          // Pick items that have recent property
          callback: function (e) { return e.recent; },
          itemText: generateLink,
          listItemProperties: addListColors
        }).
        // Adds a "Group"
        addGroup({
          name: "Favorites",
          data: buses,
          // Pick items that have favorite property
          callback: function (e) { return e.favorite; },
          itemText: generateLink,
          listItemProperties: addListColors,
        }).
        // Adds a "Group"
        addGroup({
          name: "All",
          data: buses,
          itemText: generateLink,
          listItemProperties: addListColors,
          // Picks all items. By default callback is:
          // callback: function (e) { return e; }
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
        }
      }

      var ifArrayEmpty  = conditionalCallback(function (data) { return data.length === 0; }),
        isSameGroupData = conditionalCallback(function (data) { return data[0].isSameData(data[1]); });

      var onRecentBusStorageChanged = function (changeInfo) {
        var busNames = changeInfo.data.recently_viewed_buses,
            recentBusObjects = busNamesToRecentBusObjects(busNames);

        ifArrayEmpty(recentBusObjects,
          function EmptyRecent() {
            accordion.groups.Recent.changeDataAndRender({
              itemText: generateEmptyLink,
              data: [{name: "No recent buses", recent: true}]
            });
          }, 
          function NotEmptyRecent(data) {
            accordion.groups.Recent.changeDataAndRender({
              itemText: generateLink,
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
                    itemText: generateEmptyLink,
                    data: [{name: "No favorite buses", favorite: true }] 
                  });
                }, 
                function NotEmptyFavorites(data) {
                  accordion.groups.Favorites.changeDataAndRender({
                    itemText: generateLink,
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


      var listLinks = document.querySelectorAll('.list-link');
      listLinks = Array.prototype.splice.call(listLinks, 0);
      listLinks.forEach(function (listLink) {
        closeSideNavForElement(listLink);
      });

      var search_list = document.querySelector("#Search_list-group");
      var recent_list = document.querySelector("#Recent_list-group");
      var favorite_list = document.querySelector("#Favorites_list-group");
      
      closeSideNavForElement(search_list);
      closeSideNavForElement(recent_list);
      closeSideNavForElement(favorite_list);
  });
});