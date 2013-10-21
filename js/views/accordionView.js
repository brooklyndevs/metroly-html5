define(['underscore', 'domReady', 'accordion', 'appState'], function (_, domReady, Accordion, appState) {

    var busesObj = appState.getBuses(), buses = [];
    _.each(busesObj.data, function (val, key) {;
      buses.push(val);
    });

    /*
     * A list item text callback.
     * Instead of Bus' name display this link.
     */
    var generateLink = function (item) {
      // Assuming HTML5 PushState would work.
      return "<a href='#" + "buses/" + item.name + "' class='list-link'>" + item.name + "</a>";
    };

    domReady(function () {

      var sideNav = document.querySelector(".side-nav");

      var enforceHeight = function (e) {
        var windowHeight = window.innerHeight + "px";
        sideNav.style.height = windowHeight;
        sideNav.style.maxHeight = windowHeight;
      };

      window.addEventListener("resize", enforceHeight);
      enforceHeight();

      var accordion = new Accordion();

      accordion.
      // 1. Set Accordion Settings.
      // Most important is the accordion id.
      // Rest are optional, but are CSS classes that Serges provided.
      setSettings({
        accordion_id: "accordion"
      }).
      // Adds a "SearchGroup"
      addSearchGroup({
        name: "Search",
        data: buses,
        itemText: generateLink,
        listItemProperties: function (e) { return { style: "border-left-color:" + e.color }; },
        maxDisplay: 6
      }).
      // Adds a "Group"
      addGroup({
        name: "Recent",
        data: buses,
        // Pick items that have recent property
        callback: function (e) { return e.recent; },
        itemText: generateLink,
        listItemProperties: function (e) { return { style: "border-left-color:" + e.color }; },
      }).
      // Adds a "Group"
      addGroup({
        name: "Favorites",
        data: buses,
        // Pick items that have favorite property
        callback: function (e) { return e.favorite; },
        itemText: generateLink,
        listItemProperties: function (e) { return { style: "border-left-color:" + e.color }; },
      }).
      // Adds a "Group"
      addGroup({
        name: "All",
        data: buses,
        itemText: generateLink,
        listItemProperties: function (e) { return { style: "border-left-color:" + e.color }; },
        // Picks all items. By default callback is:
        // callback: function (e) { return e; }
      }).
      // Draw both "Group"s and "SearchGroup"s
      drawGroups().
      // Add event listeners to Groups
      addListeners();


  });
});