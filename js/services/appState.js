define(['jquery', 'storage'], function ($, Storage) {

  var CHECK_UPDATES_DAYS = 3,
    BUSES_URL = 'http://www.metrolyapp.com/v1/buses/nyc?callback=?';

  console.log('Init the AppState module');

  var AppState = function () {
    console.log('Init the AppState module instance');

    this.appInfoStorage = Storage.get('appInfo');
    this.busesStorage = Storage.get('buses');
  };

  AppState.prototype.needsUpdate = function () {
    var appInfo = Storage.get('appInfo'),
      lastUpdated,
      expiration = new Date();

    if (appInfo.data.last_updated) {
     lastUpdated = new Date(appInfo.data.last_updated);
     expiration.setDate(lastUpdated.getDate() + CHECK_UPDATES_DAYS);
    }

    return !lastUpdated || lastUpdated >= expiration;
  };

  AppState.prototype.queryAvailableBuses = function (cb) {

    var
      self = this,
      busQuery = $.ajax({
      url: BUSES_URL,
      dataType: 'jsonp'
    });

    busQuery.done(function (buses) {
      var busList = {};
      buses.forEach(function (bus) {
        busList[bus.name.toLowerCase()] = {name: bus.name, color: bus.color, recent: false, favorite: false};
      });

      var k;
      for (k in busList) {
        if (!buses[k]) {
          self.busesStorage.insert(k, busList[k]);
        }
      }

      self.busesStorage.save();
      self.appInfoStorage.insert('last_updated', new Date());
      self.appInfoStorage.save();

      cb && cb();
    });

    busQuery.fail(function (err) {
      console.log('failed to get it ', err);
      cb && cb();
    });
  };

  AppState.prototype.init = function (cb) {
    if (this.needsUpdate()) {
      console.log('Needs an update');
      this.queryAvailableBuses(cb);
    } else {
      console.log('Up to date');
      cb && cb();
    }
  };

  AppState.prototype.getSettings = function () {
    return this.appInfoStorage;
  };

  AppState.prototype.getBuses = function () {
    return this.busesStorage;
  };

  AppState.prototype.reload = function () {
    this.appInfoStorage.reload();
    this.busesStorage.reload();
  };

  return new AppState();
});