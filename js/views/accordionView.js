define(['domReady', 'accordion'], function (domReady, Accordion) {

  domReady(function () {

    // require(['accordion']);

    var buses = [
      {name:"B36",   favorite: true, recent: true, class: "list-red" },
      {name:"B1",    favorite: true, class: "list-blue"              },
      {name:"Bx78"                                },
      {name:"B23",   favorite: true, recent: true },
      {name:"Bx15",  favorite: true               },
      {name:"M15"                                 },
      {name:"M16"                                 },
      {name:"M17"                                 },
      {name:"M18"                                 },
      {name:"M19"                                 },
      {name:"M20"                                 },
      {name:"M21"                                 },
      {name:"M22"                                 },
      {name:"M23"                                 },
    ];

    /* 
     * A list item text callback.
     * Instead of Bus' name display this link.
     */
    var generateLink = function (item) {
      // Assuming HTML5 PushState would work.
      return "<a href='#" + "buses/" + item.name + "' class='list-link'>" + item.name + "</a>";
    };


    // If loaded right away it is rendered before the MapView.
    // Probably should require MapView first, and THEN load this script
    setTimeout(function() {

      // Fixes .side-nav overflow
      var section_height = document.querySelector("section.page").clientHeight + "px";
      document.querySelector(".side-nav").style.height = section_height;
      //console.log("Height is set to:", section_height);


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
        maxDisplay: 6
      }).
      // Adds a "Group"
      addGroup({
        name: "Recent", 
        data: buses,
        // Pick items that have recent property
        callback: function (e) { return e.recent; },
        itemText: generateLink
      }).
      // Adds a "Group"
      addGroup({
        name: "Favorites", 
        data: buses,
        // Pick items that have favorite property
        callback: function (e) { return e.favorite; },
        itemText: generateLink
      }).
      // Adds a "Group"
      addGroup({
        name: "All", 
        data: buses,
        itemText: generateLink
        // Picks all items. By default callback is:
        // callback: function (e) { return e; }
      }).
      // Draw both "Group"s and "SearchGroup"s
      drawGroups().
      // Add event listeners to Groups
      addListeners();

    }, 1000);


    /* API for CHANGING DATA */


    //accordion.groups["All"] or
    /*var new_buses = [{name:"Magic Bus"}];
    accordion.groups.All.changeData({
      data: new_buses
    }).drawItems();*/

    // Calls changeData().drawItems() per each group. Convenient if data IS SAME
    // for all of the groups. (If callbacks are different, it is still the same data)
    /*accordion.changeAllData({
      data: [{name: "B36", recent: true, favorite: true}, {name: "M3", favorite: true}]
    });*/

    // Should produce NO RECENT ITEMS
    /*accordion.changeAllData({
      data: [{name: "B36", favorite: true}, {name: "M3", favorite: true}]
    });*/

    // Should add TrolleyBus to Recent & change the recent's callback
    /*accordion.groups.Recent.changeData({
      data: [{name: "TrolleyBus", ok: true}],
      callback: function (e) { return e.ok; }
    }).drawItems();*/
    
    // Should change data, but set NO items since they don't pass callback
    /*accordion.groups.Recent.changeData({
      data: [{name: "TrolleyBus", recent: true}],
      callback: function (e) { return e.ok; }
    }).drawItems();*/

  });
});