define(['backbone'], function (Backbone) {

  var ANY_EVENT = '*';

  var saveToLocalStorage = function (data) {
    localStorage.setItem(data.name, JSON.stringify(data.data));
  };

  var getFromLocalStorage = function (name) {
    return JSON.parse(localStorage.getItem(name)) || {};
  };

  var Storage = function (collName) {
    if (!localStorage) {
      throw new Error("localStorage not supported");
    }

    if (!getFromLocalStorage(collName)) {
      saveToLocalStorage({ name: collName, data: {} });
    }

    this.name = collName;
    this.data = getFromLocalStorage(collName);
    return _.extend(this, Backbone.Events);
  };

  Storage.get = function (collName) {
    var storage = new Storage(collName);
    return storage;
  };

  Storage.prototype.toggle = function (name, data) {
    if (this.data[name]) {
      this.remove(name);
    } else {
      this.insert(name, data);
    }
  };

  Storage.prototype.find = function (name) {
    return this.data[name];
  };

  Storage.prototype.insert = function (name, data) {
    this.data[name] = data;
    var changeInfo = {inserted: name, data: this.data};
    this.notify(name, changeInfo);
    this.notify(ANY_EVENT, changeInfo)
  };

  Storage.prototype.remove = function (name) {
    var dataItem = this.data[name];
    var changeInfo = {inserted: name, data: this.data};
    this.notify(name, changeInfo);
    this.notify(ANY_EVENT, changeInfo);
    delete this.data[name];
  };

  Storage.prototype.notify = function (eventName, data) {
    if (this.trigger) {
      this.trigger(eventName, data);
    }
  }

  Storage.prototype.save = function () {
    saveToLocalStorage({name: this.name, data: this.data});
    console.log('Saved to localStorage for ', this.name, ' data: ', this.data);
    var changeInfo = {saved: true, data: this.data};
    this.notify(ANY_EVENT, changeInfo);
  };

  Storage.prototype.contains = function (name) {
    return !!this.data[name];
  };

  Storage.prototype.reload = function () {
    this.data = getFromLocalStorage(this.name);
  };

  return Storage;
});