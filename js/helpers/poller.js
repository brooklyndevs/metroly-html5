(function (root) {

  var bind = function (fn, ctx) {
    var boundFn = function () {
      return fn.call(ctx);
    };
    return boundFn;
  };

  var ShortPoll = function (timespan) {
    this.timespan = timespan;
    this.intervalId = null;
    this.running = false;
  };

  ShortPoll.prototype.start = function (fn) {
    if (!this.running) {
      console.log('start');
      this.running = true;
      this.intervalId = root.setInterval(fn, this.timespan);
      fn();
    }
  };

  ShortPoll.prototype.stop = function() {
    if (this.running) {
      console.log('stop');
      this.running = false;
      root.clearInterval(this.intervalId);
    }
  };

  root.ShortPoll = ShortPoll;
}(this));