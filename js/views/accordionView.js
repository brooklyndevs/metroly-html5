define(['underscore', 'domReady', 'accordion', 'appState'], function (_, domReady, Accordion, appState) {

    var busesObj = appState.getBuses(),
      buses = [];

    _.each(busesObj.data, function (val, key) {
      buses.push(val);
    });

    buses = _.sortBy(buses, function (bus) {
      return bus.name;
    });

    var enforceHeight = function (element) {
      var element = document.querySelector(element);

      return function () {
        var windowHeight = window.innerHeight + "px";
        element.style.height = windowHeight;
        element.style.maxHeight = windowHeight;
      };

    };

    /*
     * A list item text callback.
     * Display bus link for each item.
     */
    var generateLink = function (item) {
      // Assuming HTML5 PushState would work.
      return "<a href='#" + "buses/" + item.name + "' class='list-link'>" + item.name + "</a>";
    },
    /*
     * Display color as style property for list item
     */
      addListColors = function (item) {
      return { style: "border-left-color:" + item.color };
    };


    domReady(function () {

      /*
       * Change Side Navigation height to window
       * to make elements inside to cause overflow-y
       */
      var enforceSideNavHeight = enforceHeight(".side-nav");
      enforceSideNavHeight();
      window.addEventListener("resize", enforceSideNavHeight);


      var busNamesToRecentBusObjects = function (busNames) {
        var busesArr = [];
        _.each(busNames, function (recentBus) {
          busesArr.push({name: recentBus, recent: true, color: busesObj.data[recentBus.toLowerCase()].color});
        });
        return busesArr;
      };

      var changeRecentListAccordion = function (busesArr) {
          accordion.groups.Recent.changeData({
            data: busesArr,
            callback: function (e) { return e.recent; }
          }).renderItems();
      };

      var checkFavoriteEmpty = function(){
        if(accordion.groups.Favorites.items.length == 0){
          accordion.groups.Favorites.changeData({
            data: [{
              color: "",
              favorite: true,
              name: "Empty",
              recent: false
            }],
            callback: function (e) { return e.favorite; }
          }).renderItems();
        }
      }
      var addRecentEmpty = function(){
        accordion.groups.Recent.changeData({
          data: [{
            color: "",
            favorite: false,
            name: "Empty",
            recent: true
          }],
          callback: function (e) { return e.recent; }
        }).renderItems();
      }

      var settings = appState.getSettings();

      /* Side Navigation Accordion */
      var accordion = new Accordion().
        // 1. Set Accordion Settings.
        // Most important is the accordion id. Rest are optional, but are CSS classes that Serges provided.
        setSettings({
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
          data: busNamesToRecentBusObjects(settings.find('recently_viewed_buses')),
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

      // Set Empty to Favorites list
      checkFavoriteEmpty();
    
      // Set Empty to Recent list
      addRecentEmpty();

      var onRecentBusStorageChanged = function (changeInfo) {
        var busNames = changeInfo.data.recently_viewed_buses;
        var recentBusObjects = busNamesToRecentBusObjects(busNames);
        changeRecentListAccordion(recentBusObjects);
      };

      settings.on('recently_viewed_buses', onRecentBusStorageChanged);

      busesObj.on('*', function (changeInfo) { // listen on all events.
        console.log("Fav lenght: ",accordion.groups.Favorites.items.length);
        if (changeInfo.saved) {
          var favBuses = _.filter(busesObj.data, function (bus) {
            return bus.favorite;
          });

          accordion.groups.Favorites.changeData({
            data: favBuses,
            callback: function (e) { return e.favorite; }
          }).renderItems();
          checkFavoriteEmpty();
        }
      });

      /* Close Side Nav when clicking on links */
      function closeSideNavForElement(element) {
        element.addEventListener('click', function (e) {
          e.stopPropagation();
          console.log('clicked on sidenav element');
          document.querySelector('#menu-btn').click();
          return false;
        });
      }

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