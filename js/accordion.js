/*jslint nomen: true, unparam: true, indent: 2 */
(function () {

    var root = this,
        oldAccordion = root.Accordion;

    // __.getAndSetId = (function (prefix) {
    //   var incrementingId = 0;
    //   prefix = prefix || "";
    //   return function (element) {
    //     if (!element.id) element.id = prefix + incrementingId++;
    //     return element.id;
    //   };
    // })("accordion_");

    var Helper = {
        toArray: function (arrayLikeObj) {
            return Array.prototype.slice.call(arrayLikeObj);
        },
        iterate: function (items, cb) {
            return Helper.toArray(items).forEach(cb);
        },
        toId: function () {
            return "#" + Helper.toArray(arguments).join("_");
        },
        getId: function () {
            return document.querySelector(Helper.toId.apply(null, arguments));
        }
    };


    /* 
     * Settings object. Shared along Groups
     */
    var Settings = function (stats) {
        
        this.actionCallbacks = {};

        this.settings = {

            accordion_id: "",

            search_group_input_name: "fname",
            search_group_input_cancel_class: "search-cancel",
            search_group_input_magnifier_class: "search-magnifier",
            search_group_wrapper_class: "list-wrapper",
            search_group_header_class: "section-header",
            search_group_list_class: "list-group",
            search_group_item_single_class: "list-single",


            group_wrapper_class: "list-wrapper",
            group_header_class: "list-header",
            group_item_class: "list-group",
            group_item_single_class: "list-single"
        };
        for (var i in stats) {
            // hasOwnProperty ... c'mon
            this.settings[i] = stats[i];
        }
        return this;
    };
    // PubSub
    Settings.prototype.subscribe = function (actionName, callback) {
        if (!this.actionCallbacks[actionName]) this.actionCallbacks[actionName] = [];
        this.actionCallbacks[actionName].push(callback);
        return this;
    };
    Settings.prototype.notify = function (actionName) {
        var args = Array.prototype.splice.call(arguments, 1);
        for (var i in this.actionCallbacks) {
            if (this.actionCallbacks.hasOwnProperty(i) && i === actionName) {
                this.actionCallbacks[i].forEach(function (callback) {
                    // call back the callbacks that were added to PubSub for this action Name.
                    // console.log('Notifying ', actionName, " with these args: ", args);
                    callback.apply(null, args);
                });
            }
        }
        return this;
    };



    // The whole accordion
    var Accordion = function () {
        this.groups = {};
        this.settings = {};
        return this;
    };

    // A convenience function. Should ONLY be used
    // when data for all accordion is same.
    Accordion.prototype.changeAllData = function (data) {
        var self = this;
        for (var group in self.groups) {
            if (self.groups.hasOwnProperty(group)) {
                self.groups[group].changeData(data).renderItems();
            }
        }
        return this;
    };

    Accordion.prototype.setData = function (data) {
        data.forEach(this.addGroup);
        return this;
    };
    Accordion.prototype.addGroup = function (group) {
        // Object with name, data, callback 
        this.groups[group.name] = new Group(group, this.settings);
        return this;
    };
    Accordion.prototype.addSearchGroup = function (group) {
        // Object with name, data, callback 
        this.groups[group.name] = new SearchGroup(group, this.settings);
        return this;
    };


    Accordion.prototype.setSettings = function (settings) {
        this.settings = new Settings(settings);
        return this;
    };

    Accordion.prototype.render = function () {
        for (var group in this.groups) {
            if (this.groups.hasOwnProperty(group)) {
                this.groups[group].render();
            }
        };
        // do something else
        return this;
    };

    // Not very cool, but should do it
    Accordion.prototype.addListeners = function () {

        var self = this;

        for (var group in self.groups) {
            if (self.groups.hasOwnProperty(group)) {
                self.groups[group].addListeners();
            }
        };

        // Subscribe to "clickGroup" PubSub
        self.settings.subscribe("clickGroupExpand", function (groupName, collapseAll) {
            for (var grName in self.groups) {
                if (grName === groupName) {
                    // Expand this group
                    if (!collapseAll) {
                        self.groups[grName].toggleCollapse(); // no param means expand
                        continue;
                    }
                }
                self.groups[grName].toggleCollapse(true);
            }
        });

        return this;
    };



    /*
     * IGroup - an "interface" for Group and SearchGroup
     *
     */
    var IGroup = function () {
        var self = this;
        // for now, change later
        if (self.isImplementation) {
            self.changeData(self.data);
        }
    };
    IGroup.prototype.render = function () {
        throw new Error("Mush overwrite this method!");
    };
    IGroup.prototype.addListeners = function () {
        throw new Error("Must overwrite this method!");
    };
    IGroup.prototype.changeData = function (data) {

        var self = this,
            default_callback = function (e) {
                return e;
            };

        self.name = data.name || self.name;
        self.callback = data.callback || self.callback || default_callback;

        var tempItems = data.data || self.items;
        self.items = [];

        tempItems.forEach(function (i) {
            // hasOwnProperty... c'mon
            if (self.callback(i)) self.items.push(i);
        });

        //console.log('Changing data to:', data, self);
        return this;
    };


    // A single, isolated group of buses
    var Group = function (data, settings) {
        // 2. Add data to this
        this.isImplementation = true;
        this.data = data;
        this.settings = settings;
        // for now, change later
        this.params = this.settings.settings;

        // 3. Apply miself onto IGroup.
        IGroup.apply(this);
    };
    // 1. Inherit functions throught the prototypal chain
    Group.prototype = new IGroup();

    Group.prototype.render = function () {
        var self = this,
            itemsHTML = "";

        itemsHTML += "<div class='" + self.params.group_wrapper_class + "' id='" + self.name + "_" + self.params.group_wrapper_class + "'>";
        itemsHTML += "<p class='" + self.params.group_header_class + "' id='" + self.name + "_" + self.params.group_header_class + "'>" + self.name + "</p>";
        itemsHTML += "<ul class='" + self.params.group_item_class + "' id='" + self.name + "_" + self.params.group_item_class + "'>";
        itemsHTML += self.getItemsHTML();
        itemsHTML += "</ul>";
        itemsHTML += "</div>";

        Helper.getId(self.params.accordion_id).innerHTML += itemsHTML;

        return this;
    };

    Group.prototype.getItemsHTML = function () {
        var self = this,
            itemsHTML = "",
            itemClass = "";

        self.items.forEach(function (item) {
            itemsHTML += "<li ";
            
            itemClass = self.params.group_item_single_class + " " + (item.class || "");

            if (self.data.listItemProperties) {
                
                var itemProperties = self.data.listItemProperties(item);

                for (var property in itemProperties) {
                    if (itemProperties.hasOwnProperty(property)) {
                        if (property === "class") {
                            itemClass += (" " + itemProperties[property]);
                            continue;
                        }
                        //console.log("Property is:", property,"='", itemProperties[property], "'");
                        itemsHTML += (" " + property + "='" + itemProperties[property] + "' ");
                    }
                }
            }

            itemClass = (" class='" + itemClass + "'");
            itemsHTML += (itemClass + ">");
            if (self.data.itemText) {
                itemsHTML += self.data.itemText(item);
            } else {
                itemsHTML += item.name;
            }
            itemsHTML += "</li>"
        });
        return itemsHTML;
    };

    Group.prototype.renderItems = function () {
        Helper.getId(this.name, this.params.group_item_class).innerHTML = this.getItemsHTML();
        return this;
    };

    Group.prototype.addListeners = function () {
        var self = this,
            header = Helper.getId(self.name, self.params.group_header_class);

        //console.log("Group header: ", header, self.name + "_" + self.params.group_header_class);
        header.addEventListener("click", function () {
            var collapseAll = (!self.isCollapsed() ? true : false);
            self.settings.notify("clickGroupExpand", self.name, collapseAll);
        }, false);

        return this;
    };

    Group.prototype.isCollapsed = function () {
        var self = this;
        // non-cached
        if (self.isListCollapsed == null) {
            var element = Helper.getId(self.name, self.params.group_item_class).childNodes[0];
            var display = (element ? element.style.display : false);
            self.isListCollapsed = (display ? false : true);
        }
        return self.isListCollapsed;
    };

    /* 
     * Collapse/Expand based on isListCollapsible
     * caches isListCollapsible
     */
    Group.prototype.toggleCollapse = function (action) {

        var self = this;

        self.isListCollapsed = false;
        display = "block";

        if (action) {
            self.isListCollapsed = true;
            display = "";
        }

        Helper.iterate(
            Helper.getId(self.name, self.params.group_item_class).childNodes,
            function (i) {
                i.style.display = display;
                //if (display === "block") {
                    //console.log("#" + self.name + "_" + self.params.group_item_class);
                    //i.style["-webkit-animation"] = "fadeIn 1s";
                    //i.style["animation"] = "fadeIn 1s";
                //}
            });

        return this;
    };



    var SearchGroup = function (data, settings) {
        // 2. Add data to this
        this.isImplementation = true;
        this.data = data;
        this.settings = settings;
        // for now, change later
        this.params = this.settings.settings;

        // 3. Apply miself onto IGroup.
        IGroup.apply(this);
    };
    // 1. Inherit functions throught the prototypal chain
    SearchGroup.prototype = new IGroup();

    SearchGroup.prototype.render = function () {
        var self = this,
            groupHTML = "";

        groupHTML += "<div class='" + self.params.search_group_wrapper_class + "'>";
        groupHTML += "<div class='" + self.params.search_group_header_class + "'>";

        //groupHTML += "<form>";
        groupHTML += "<input type='search' name='" +
            self.params.search_group_input_name + "' placeholder='Search Buses' id='" + self.name + "_" + self.params.search_group_input_name + "'>";
        //groupHTML += "</form>";

        // pretty hackish, todo: change later
        groupHTML += "<a href='#' class='" + self.params.search_group_input_cancel_class + "' id='" + self.name + "_" + self.params.search_group_input_cancel_class + "'>&nbsp;&nbsp;&nbsp;</a>";
        groupHTML += "<a class='" + self.params.search_group_input_magnifier_class + "' >&nbsp;</a>";

        groupHTML += "</div>";
        groupHTML += "<ul class='" + self.params.search_group_list_class + "' id='" + self.name + "_" + self.params.search_group_list_class + "'>";
        groupHTML += "</ul>";
        groupHTML += "</div>";

        Helper.getId(self.params.accordion_id).innerHTML += groupHTML;

        return this;
    };

    SearchGroup.prototype.addListeners = function () {
        var self = this,
            input = Helper.getId(self.name, self.params.search_group_input_name),
            cancel_input = Helper.getId(self.name, self.params.search_group_input_cancel_class);

        input.addEventListener("keyup", function () {
            var collapseAll = true;

            if (this.value) {
                collapseAll = false;
                self.renderItems(this.value);
            }
            self.settings.notify("clickGroupExpand", self.name, collapseAll);

        }, false);

        cancel_input.addEventListener("click", function (e) {
            e.preventDefault();
            input.value = "";
            self.settings.notify("clickGroupExpand", self.name, true);
        }, false);

        return this;
    };

    SearchGroup.prototype.getMatchedItems = function (value) {
        var self = this,
            searchResults = [],
            regEx = new RegExp(value, "i");

        self.items.forEach(function (i) {
            if (i.name.match(regEx)) searchResults.push(i);
        });

        return searchResults;
    };

    SearchGroup.prototype.getSearchItemsHTML = function (value) {
        var self = this,
            items = this.getMatchedItems(value),
            matches = [],
            itemClass = "";

        items.forEach(function (item) {
            var match = "<li";

            itemClass = self.params.search_group_item_single_class + " " + (item.class || "");

            if (self.data.listItemProperties) {

                var itemProperties = self.data.listItemProperties(item);

                for (var property in itemProperties) {
                    if (itemProperties.hasOwnProperty(property)) {
                        if (property === "class") { 
                            itemClass += (" " + itemProperties[property]);
                            continue;
                        }
                        match += (" " + property + "='" + itemProperties[property] + "'");
                    }
                }
            }
            itemClass = (" class='" + itemClass + "'");
            match += itemClass + ">";

            if (self.data.itemText) {
                match += self.data.itemText(item);
            } else {
                match += item.name;
            }
            match += "</li>";
            if (!(self.data.maxDisplay && matches.length >= self.data.maxDisplay)) matches.push(match);
        });
        return matches.join("");
    };

    SearchGroup.prototype.renderItems = function (value) {
        Helper.getId(this.name, this.params.search_group_list_class).innerHTML = this.getSearchItemsHTML(value);
        return this;
    };

    SearchGroup.prototype.isCollapsed = function () {
        var self = this;
        // non-cached
        if (self.isListCollapsed == null) {
            var element = Helper.getId(self.name, self.params.search_group_list_class).childNodes[0];
            var display = (element ? element.style.display : false);
            self.isListCollapsed = (display ? false : true);
        }
        return self.isListCollapsed;
    };

    /* 
     * Collapse/Expand based on isListCollapsible
     * caches isListCollapsible
     */
    SearchGroup.prototype.toggleCollapse = function (action) {

        var self = this;

        self.isListCollapsed = false;
        display = "block";

        if (action) {
            self.isListCollapsed = true;
            display = "";
        }

        Helper.iterate(
            Helper.getId(self.name, self.params.search_group_list_class).childNodes,
            function (i) {
                i.style.display = display;
            });

        return this;
    };

    // Run Accordion in noConflict mode, 
    // returning the Accordion variable to its previous owner. 
    // Returns a reference to the Teletype object.
    Accordion.prototype.noConflict = function () {
        root.Accordion = oldAccordion;
        return this;
    };

    // Register as a named AMD module, since Accordion can be concatenated with other
    // files that may use define, but not via a proper concatenation script that
    // understands anonymous AMD modules. A named AMD is safest and most robust
    // way to register. Lowercase jquery is used because AMD module names are
    // derived from file names, and Accordion is normally delivered in a lowercase
    // file name. Do this after creating the global so that if an AMD module wants
    // to call noConflict to hide this version of Accordion, it will work.
    if (typeof define === "function" && define.amd) {
        define("accordion", [], function () {
            return Accordion;
        });
    }

    root.Accordion = Accordion;
})();