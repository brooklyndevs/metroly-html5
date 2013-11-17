/* jslint nomen: true, unparam: true, indent: 4 */
/* global define */

(function (undefined) {
    "use strict";

    var root = this,
        oldAccordion = root.Accordion;

    var Helper = {
        toArray: function (arrayLikeObj, slicing) {
            slicing = slicing || 0;
            return Array.prototype.slice.call(arrayLikeObj, slicing);
        },
        iterate: function (items, cb) {
            return Helper.toArray(items).forEach(cb);
        },
        toId: function () {
            return "#" + Helper.toArray(arguments).join("_");
        },
        getId: function () {
            return document.querySelector(Helper.toId.apply(null, arguments));
        },
        haveSameElements: function (a, b, sortParam) {
            if (a === b) return true;
            if ((a === null || a === undefined) || (b === null || b === undefined)) return false;
            if (a.length != b.length) return false;

            // If you don't care about the order of the elements inside
            // the array, you should sort both arrays here.
            a.sort(function(f, s) { return f[sortParam] > s[sortParam]; });
            b.sort(function(f, s) { return f[sortParam] > s[sortParam]; });

            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        },
        // Just like underscore's extend method
        // destination object, [source1, ...]
        extend: function (obj) {
            Helper.toArray(arguments, 1).forEach(function(source) {
                if (source) {
                    for (var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
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
            group_item_single_class: "list-single",

            name: "",

            getId: function (setting) { return this.name + "_" + setting; }
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
        var args = Array.prototype.splice.call(arguments, 1),
            applyCallback = function (callback) {
                // call back the callbacks that were added to PubSub for this action Name.
                callback.apply(null, args);
            };

        for (var i in this.actionCallbacks) {
            if (this.actionCallbacks.hasOwnProperty(i) && i === actionName) {
                this.actionCallbacks[i].forEach(applyCallback);
            }
        }
        return this;
    };



    // The whole accordion
    var Accordion = function (settings) {
        this.groups = {};
        if (settings) this.setSettings(settings);
        else this.settings = {};
        return this;
    };

    // A convenience function. Should ONLY be used
    // when data for all accordion is same.
    Accordion.prototype.changeData = function (data) {
        var self = this;
        for (var group in self.groups) {
            if (self.groups.hasOwnProperty(group)) {
                self.groups[group].changeData(data).renderListItems();
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
                this.groups[group].renderGroup();
            }
        }
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
        }

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
     */
    var IGroup = function () {
        var self = this;
        // for now, change later
        if (self.isImplementation) {
            self.changeData(self.data);
        }
    };
    IGroup.prototype.render = function (element, data, rerender) {
        element.innerHTML = (rerender ? element.innerHTML + data : data);
        if (this.data.afterRender) this.data.afterRender(this.params, this.data);
    };
    IGroup.prototype.renderGroup = function () {
        throw new Error("Must overwrite this method!");
    };
    IGroup.prototype.addListeners = function () {
        throw new Error("Must overwrite this method!");
    };
    IGroup.prototype.changeData = function (data) {


        var self = this,
            default_callback = function (e) {
                return e;
            };

        for (var e in data) {
            // hasOwnProperty... c'mon
            self.data[e] = data[e];
        }

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
    IGroup.prototype.getData = function () {
        return this.data;
    };
    IGroup.prototype.changeDataAndRender = function (data) {
        if (this.isImplementation) {
            return this.changeData(data).renderListItems();
        } else {
            throw new Error("Must overwrite this method!");
        }
    };

    IGroup.prototype.isSameData = function (new_data) {
        if (this.isImplementation) {
            return Helper.haveSameElements(this.data, new_data);
        } else {
            throw new Error("Must overwrite this method!");
        }
    };

    IGroup.prototype.changeSettings = function () {
        var self = this;
        Helper.toArray(arguments).forEach(function (e) {
            self.settings = Helper.extend.apply(undefined, [self.settings, e]);
        });
        if (this.settings.settings) this.params = this.settings.settings;
    };


    // A single, isolated group of buses
    var Group = function (data, settings) {
        this.isImplementation = true;
        
        // 2. Add data to this
        this.data = data;
        
        this.settings = settings;

        this.params = Helper.extend({}, this.settings.settings);
        
        // 3. Apply miself onto IGroup mate.
        IGroup.apply(this);
        this.params.name = this.name;
    };
    // 1. Inherit functions throught the prototypal chain
    Group.prototype = new IGroup();

    Group.prototype.renderGroup = function () {
        var itemsHTML = "";

        if (this.data.beforeRender) this.data.beforeRender(this.params);

        itemsHTML += "<div class='" + this.params.group_wrapper_class + "' id='" + this.params.getId(this.params.group_wrapper_class) + "'>";
        itemsHTML += "<p class='" + this.params.group_header_class + "' id='" + this.params.getId(this.params.group_header_class) + "'>" + this.name + "</p>";
        itemsHTML += "<ul class='" + this.params.group_item_class + "' id='" + this.params.getId(this.params.group_item_class) + "'>";
        itemsHTML += this.getItemsHTML();
        itemsHTML += "</ul>";
        itemsHTML += "</div>";

        this.render(Helper.getId(this.params.accordion_id), itemsHTML, true);

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

            itemsHTML += "</li>";
        });
        return itemsHTML;
    };

    Group.prototype.renderListItems = function () {
        if (this.data.beforeRender) this.data.beforeRender(this.params);
        this.render(Helper.getId(this.name, this.params.group_item_class), this.getItemsHTML());
        return this;
    };

    Group.prototype.addListeners = function () {
        var self = this,
            header = Helper.getId(self.name, self.params.group_header_class);

        header.addEventListener("click", function () {
            var collapseAll = (!self.isCollapsed() ? true : false);
            self.settings.notify("clickGroupExpand", self.name, collapseAll);
        }, false);

        return this;
    };

    Group.prototype.isCollapsed = function () {
        // non-cached
        if (this.isListCollapsed === null || this.isListCollapsed === undefined) {
            var element = Helper.getId(this.name, this.params.group_item_class).childNodes[0];
            var display = (element ? element.style.display : false);
            this.isListCollapsed = (display ? false : true);
        }
        return this.isListCollapsed;
    };

    /* 
     * Collapse/Expand based on isListCollapsible
     * caches isListCollapsible
     */
    Group.prototype.toggleCollapse = function (action) {

        var self = this,
            display = "block";
        
        this.isListCollapsed = false;

        if (action) {
            this.isListCollapsed = true;
            display = "";
        }

        Helper.iterate(
            Helper.getId(self.name, self.params.group_item_class).childNodes,
            function (i) { i.style.display = display; }
        );

        return this;
    };


    // A single group of buses that is searchable
    var SearchGroup = function (data, settings) {
        // 2. Add data to this
        this.isImplementation = true;
        this.data = data;
        this.settings = settings;
        
        this.params = Helper.extend({}, this.settings.settings);
        
        // 3. Apply miself onto IGroup.
        IGroup.apply(this);
        this.params.name = this.name;
    };
    // 1. Inherit functions throught the prototypal chain
    SearchGroup.prototype = new IGroup();

    SearchGroup.prototype.renderGroup = function () {
        var groupHTML = "";

        if (this.data.beforeRender) this.data.beforeRender(this.params);

        groupHTML += "<div class='" + this.params.search_group_wrapper_class + "'>";
        groupHTML += "<div class='" + this.params.search_group_header_class + "'>";

        //groupHTML += "<form>";
        groupHTML += "<input type='search' name='" +
            this.params.search_group_input_name + "' placeholder='Search Buses' id='" + this.params.getId(this.params.search_group_input_name) + "'>";
        //groupHTML += "</form>";

        // pretty hackish, todo: change later
        groupHTML += "<a href='#' class='" + this.params.search_group_input_cancel_class + "' id='" + this.params.getId(this.params.search_group_input_cancel_class) + "'>&nbsp;&nbsp;&nbsp;</a>";
        groupHTML += "<a class='" + this.params.search_group_input_magnifier_class + "' >&nbsp;</a>";
        groupHTML += "</div>";
        groupHTML += "<ul class='" + this.params.search_group_list_class + "' id='" + this.params.getId(this.params.search_group_list_class) + "'>";
        groupHTML += "</ul>";
        groupHTML += "</div>";

        this.render(Helper.getId(this.params.accordion_id), groupHTML, true);
        
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
                self.renderListItems(this.value);
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
        var searchResults   = [],
            searchResults2  =[],
            tempResults = [],
            regEx = new RegExp("^" + value, "i"),
            regEx2 = new RegExp(value, "i");
        

        function getMatchResults(regEx, array) {
            var results = [];
            array.forEach(function (i) {
                if (i.name.match(regEx)) results.push(i);
            });
            return results;
        }

        searchResults = getMatchResults(regEx, this.items);

        var leftToFill = this.data.maxDisplay - searchResults.length;

        //TODO: Optimize: n^2
        if (leftToFill > 0) {
            searchResults2 = getMatchResults(regEx2, this.items);
            tempResults = [];
            searchResults.forEach(function (betterResult) {
                var match = null;
                for (var i = 0, length = searchResults2.length; i < length; i++) {
                    if (betterResult.name == searchResults2[i].name) {
                        match = null;
                        break;
                    } else {
                        match = searchResults2[i];
                    }
                }
                if (match && leftToFill) {
                    leftToFill-=1;
                    tempResults.push(match);
                }
            });
            if (!searchResults.length) {
                tempResults = searchResults2.splice(0, leftToFill);
            }
            searchResults = searchResults.concat(tempResults);
        }

        return searchResults;
    };

    SearchGroup.prototype.getSearchItemsHTML = function (value) {
        var self = this,
            items = this.getMatchedItems(value),
            matches = [],
            itemClass = "";

        items.forEach(function (item) {
            var match = "<li ";

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

    SearchGroup.prototype.renderListItems = function (value) {
        if (this.data.beforeRender) this.data.beforeRender(this.params);
        this.render(Helper.getId(this.name, this.params.search_group_list_class), this.getSearchItemsHTML(value));
        return this;
    };

    SearchGroup.prototype.isCollapsed = function () {
        // non-cached
        if (this.isListCollapsed === null || this.isListCollapsed === undefined) {
            var element = Helper.getId(this.name, this.params.search_group_list_class).childNodes[0];
            var display = (element ? element.style.display : false);
            this.isListCollapsed = (display ? false : true);
        }
        return this.isListCollapsed;
    };

    /* 
     * Collapse/Expand based on isListCollapsible
     * caches isListCollapsible
     */
    SearchGroup.prototype.toggleCollapse = function (action) {

        var self = this,
            display = "block";

        this.isListCollapsed = false;

        if (action) {
            this.isListCollapsed = true;
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
    
}).call(this);