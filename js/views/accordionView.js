define(['underscore', 'domReady', 'accordion', 'appState'], function (_, domReady, Accordion, appState) {

    var busesObj = appState.getBuses(),
      buses = [];

    _.each(busesObj.data, function (val, key) {
      buses.push(val);
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
          data: buses,
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

  });
});