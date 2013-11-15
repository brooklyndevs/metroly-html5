/* jslint nomen: true, unparam: true, indent: 2 */
/* jshint eqeqeq: false */
/* global define */

(function () {
  //"use strict";

  var root = this,
    oldEventStack = root.EventStack;
  
  var EventStack = function (settings) {
    this.stack = [];
    this.settings = {
      timer: 0,
      timeout: 18,
      // Which callback to drain, if any? By default drains the last callback
      which : function (id, item, stack) {
        return id == stack.length - 1;
      },
      // Modify event stack in any way before calling drain
      // beforeDrain: function (stack) { return stack; }
      automatic: true,
      resetOnAdd: true
    };
    // Copies user-defined settings
    for (var i in settings) {
      this.settings[i] = settings[i];
    }
    this.settings.initialTimer = this.settings.timer;
    return this;
  };

  var arrPopMethods = ["unshift", "pop"];
  arrPopMethods.forEach(function(item) {
    EventStack.prototype[item] = function (i) {
      this.stack[item](i);
      return this;
    };
  });

  var arrPushMethods = ["shift", "push"];
  arrPushMethods.forEach(function(item) {
    EventStack.prototype[item] = function (i) {
      this.stack[item](i);
      if (this.settings.resetOnAdd) { this.resetTimer(); }
      // Starts the drainage of callbacks
      if (this.stack.length == 1) { this.drain(); }
      return this;
    };
  });

  EventStack.prototype.setTimer = function (time) {
    this.settings.timer = time;
    return this;
  };

  EventStack.prototype.resetTimer = function () {
    this.settings.timer = this.settings.initialTimer;
    return this;
  };

  EventStack.prototype.reset = function () {
    this.stack = [];
    this.resetTimer();
    return this;
  };

  EventStack.prototype.run = function () {
    if (!this.settings.automatic) this.drain();
    return this;
  };

  EventStack.prototype.drain = function () {
    var self = this;
    var timeout = setTimeout(function() {
      if (self.settings.timer > 0) {
        // check back in a while
        clearTimeout(timeout);
        self.settings.timer -= self.settings.timeout;
        self.drain();
      } else {
        if (self.settings.beforeDrain) self.stack = self.settings.beforeDrain(self.stack);
        
        self.stack.filter(function(item, index) {
          return self.settings.which(index, item, self.stack);
        }).forEach(function(cb) { cb(); });
        self.reset();
        return this;
      }
    }, this.settings.timeout);
  };
  
  // Run EventStack in noConflict mode, 
  // returning the EventStack variable to its previous owner. 
  // Returns a reference to the Teletype object.
  EventStack.prototype.noConflict = function () {
    root.EventStack = oldEventStack;
    return this;
  };

  // Register as a named AMD module, since EventStack can be concatenated with other
  // files that may use define, but not via a proper concatenation script that
  // understands anonymous AMD modules. A named AMD is safest and most robust
  // way to register. Lowercase jquery is used because AMD module names are
  // derived from file names, and EventStack is normally delivered in a lowercase
  // file name. Do this after creating the global so that if an AMD module wants
  // to call noConflict to hide this version of EventStack, it will work.
  if (typeof define === "function" && define.amd) {
    define("eventStack", [], function () {
      return EventStack;
    });
  }

  root.EventStack = EventStack;
})();