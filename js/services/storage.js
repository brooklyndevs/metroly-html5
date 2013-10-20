define([], function () {

  var saveToLocalStorage = function (data) {
    localStorage.setItem(data.name, JSON.stringify(data.data));
  };

  var getFromLocalStorage = function (name) {
    return JSON.parse(localStorage.getItem(name));
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
  };

  Storage.get = function (collName) {
    var storage = new Storage(collName);
    return storage.data;
  };

  Storage.prototype.toggle = function (name, data) {
    if (this.data[name]) {
      this.remove(name);
    } else {
      this.insert(name, data);
    }
  };

  Storage.prototype.insert = function (name, data) {
    this.data[name] = data;
  };

  Storage.prototype.remove = function (name) {
    delete this.data[name];
  };

  Storage.prototype.save = function () {
    saveToLocalStorage({name: this.name, data: this.data});
  };

  Storage.prototype.contains = function (name) {
    return !!this.data[name];
  };

  return Storage;
});