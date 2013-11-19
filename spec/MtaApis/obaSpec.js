define(['oba'], function (Oba) {

  describe('The OneBusAway Wrapper', function () {

    var callbacks;

    beforeEach(function () {
      callbacks = {
        gotStops: function (stops) {
          return stops;
        }
      };

      spyOn(callbacks, 'gotStops');
    });

    // Following wont work because oba is coupled to localStorage.
    // TODO Decouple it.
    // it('Gets bus stops', function () {
    //   Oba.getBusStops('b63', callbacks.gotStops);
    //   expect(callbacks.gotStops).toHaveBeenCalled();
    // });

  });

});