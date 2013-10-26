define([], function () {

  var config = {
    CHECK_UPDATES_DAYS: 3,
    CHECK_INTERVAL_DEFAULT: 30,
    BUSES_URL: 'http://www.metrolyapp.com/v1/buses/nyc?callback=?',
    CHECK_INTERVAL_SETTING: "check_interval",
    LAST_UPDATED_SETTING: 'last_updated'
  };

  return config;

});